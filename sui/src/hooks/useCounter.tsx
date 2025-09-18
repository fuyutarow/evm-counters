/**
 * Counter パッケージの統合フック
 * - owned_counter: 個人所有のカウンター
 * - shared_counter: 共有カウンター
 *
 * React hooks rulesに準拠した設計
 */

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { type SuiObjectChange, type SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { counterPackage, isOwned_counterOwnedCounterType } from "@/abi";

// Use ABI-generated type guards directly

// ================== Counter Value Query Hook ==================
export function useCounterValue(counterId?: string) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["counter", counterId],
    queryFn: async () => {
      if (!counterId) return null;
      const obj = await suiClient.getObject({
        id: counterId,
        options: { showContent: true },
      });

      if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
        return null;
      }

      if (!isOwned_counterOwnedCounterType(obj.data.content.fields)) {
        return null;
      }

      const fields = obj.data.content.fields;
      return {
        id: counterId,
        value: fields.value,
        type: "counter",
      } satisfies {
        id: string;
        value: string;
        type: "counter";
      };
    },
    enabled: !!counterId,
  });
}

// ================== Main Counter Hook ==================
import { toast } from "sonner";

const buildExplorerLink = (digest: string): string =>
  `https://testnet.suivision.xyz/txblock/${digest}`;

const showTxSuccessToast = (message: string, digest: string) => {
  toast.success(message, {
    description: (
      <a
        href={buildExplorerLink(digest)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        View transaction on SuiVision
      </a>
    ),
  });
};

export function useCounter() {
  const suiClient = useSuiClient();
  const { mutateAsync: executeTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      }),
  });
  const queryClient = useQueryClient();
  const account = useCurrentAccount();

  // ================== Owned Counter Operations ==================
  const createOwnedCounter = useMutation({
    mutationKey: ["counter", "owned", "create"],
    mutationFn: async (): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!account?.address) {
          reject(new Error("No account connected"));
          return;
        }

        const tx = new Transaction();
        const counter = counterPackage.owned_counter.new(tx);
        tx.transferObjects([counter], account.address);

        executeTransaction({ transaction: tx })
          .then((result: SuiTransactionBlockResponse) => {
            const created = result.objectChanges?.find(
              (c: SuiObjectChange) => c.type === "created",
            );

            if (!created || created.type !== "created") {
              reject(new Error("Failed to create owned counter"));
              return;
            }

            showTxSuccessToast("Owned counter created successfully!", result.digest);
            queryClient.invalidateQueries({ queryKey: ["owned-counters"] });
            resolve(created.objectId);
          })
          .catch(reject);
      });
    },
    onError: (error) => {
      toast.error("Failed to create owned counter", {
        description: error.message,
      });
    },
  });

  const incrementOwnedCounter = useMutation({
    mutationKey: ["counter", "owned", "increment"],
    mutationFn: async (counterId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const tx = new Transaction();
        counterPackage.owned_counter.increment(tx, {
          arguments: [tx.object(counterId)],
        });

        executeTransaction({ transaction: tx })
          .then((result: SuiTransactionBlockResponse) => {
            showTxSuccessToast("Counter incremented successfully!", result.digest);
            queryClient.invalidateQueries({ queryKey: ["counter", counterId] });
            queryClient.invalidateQueries({ queryKey: ["owned-counters"] });
            resolve();
          })
          .catch(reject);
      });
    },
    onError: (error) => {
      toast.error("Failed to increment counter", {
        description: error.message,
      });
    },
  });

  const setOwnedCounterValue = useMutation({
    mutationKey: ["counter", "owned", "setValue"],
    mutationFn: async (params: { counterId: string; value: bigint }): Promise<void> => {
      return new Promise((resolve, reject) => {
        const tx = new Transaction();
        counterPackage.owned_counter.set_value(tx, {
          arguments: [tx.object(params.counterId), tx.pure.u64(params.value)],
        });

        executeTransaction({ transaction: tx })
          .then((result: SuiTransactionBlockResponse) => {
            showTxSuccessToast(`Counter set to ${params.value}!`, result.digest);
            queryClient.invalidateQueries({ queryKey: ["counter", params.counterId] });
            queryClient.invalidateQueries({ queryKey: ["owned-counters"] });
            resolve();
          })
          .catch(reject);
      });
    },
    onError: (error) => {
      toast.error("Failed to set counter value", {
        description: error.message,
      });
    },
  });

  // ================== Shared Counter Operations ==================
  const createSharedCounter = useMutation({
    mutationKey: ["counter", "shared", "create"],
    mutationFn: async (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const tx = new Transaction();
        counterPackage.shared_counter.create(tx);

        executeTransaction({ transaction: tx })
          .then((result: SuiTransactionBlockResponse) => {
            const created = result.objectChanges?.find(
              (c: SuiObjectChange) => c.type === "created",
            );

            if (!created || created.type !== "created") {
              reject(new Error("Failed to create shared counter"));
              return;
            }

            showTxSuccessToast("Shared counter created successfully!", result.digest);
            queryClient.invalidateQueries({ queryKey: ["shared-counters"] });
            resolve(created.objectId);
          })
          .catch(reject);
      });
    },
    onError: (error) => {
      toast.error("Failed to create shared counter", {
        description: error.message,
      });
    },
  });

  const incrementSharedCounter = useMutation({
    mutationKey: ["counter", "shared", "increment"],
    mutationFn: async (counterId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const tx = new Transaction();
        counterPackage.shared_counter.increment(tx, {
          arguments: [tx.object(counterId)],
        });

        executeTransaction({ transaction: tx })
          .then((result: SuiTransactionBlockResponse) => {
            showTxSuccessToast("Shared counter incremented successfully!", result.digest);
            queryClient.invalidateQueries({ queryKey: ["counter", counterId] });
            queryClient.invalidateQueries({ queryKey: ["shared-counters"] });
            resolve();
          })
          .catch(reject);
      });
    },
    onError: (error) => {
      toast.error("Failed to increment shared counter", {
        description: error.message,
      });
    },
  });

  const setSharedCounterValue = useMutation({
    mutationKey: ["counter", "shared", "setValue"],
    mutationFn: async (params: { counterId: string; value: bigint }): Promise<void> => {
      return new Promise((resolve, reject) => {
        const tx = new Transaction();
        counterPackage.shared_counter.set_value(tx, {
          arguments: [tx.object(params.counterId), tx.pure.u64(params.value)],
        });

        executeTransaction({ transaction: tx })
          .then((result: SuiTransactionBlockResponse) => {
            showTxSuccessToast(`Shared counter set to ${params.value}!`, result.digest);
            queryClient.invalidateQueries({ queryKey: ["counter", params.counterId] });
            queryClient.invalidateQueries({ queryKey: ["shared-counters"] });
            resolve();
          })
          .catch(reject);
      });
    },
    onError: (error) => {
      toast.error("Failed to set shared counter value", {
        description: error.message,
      });
    },
  });

  // ================== Custom Transaction ==================
  const executeCustomTransaction = useMutation({
    mutationKey: ["counter", "custom"],
    mutationFn: async (tx: Transaction) => {
      return executeTransaction({ transaction: tx });
    },
  });

  // ================== Unified API ==================
  return {
    owned: {
      create: createOwnedCounter.mutateAsync,
      increment: incrementOwnedCounter.mutateAsync,
      setValue: setOwnedCounterValue.mutateAsync,
      useValue: useCounterValue,
      isPending: {
        create: createOwnedCounter.isPending,
        increment: incrementOwnedCounter.isPending,
        setValue: setOwnedCounterValue.isPending,
      },
    },
    shared: {
      create: createSharedCounter.mutateAsync,
      increment: incrementSharedCounter.mutateAsync,
      setValue: setSharedCounterValue.mutateAsync,
      useValue: useCounterValue,
      isPending: {
        create: createSharedCounter.isPending,
        increment: incrementSharedCounter.isPending,
        setValue: setSharedCounterValue.isPending,
      },
    },

    // 汎用的なトランザクション構築ヘルパー
    buildTx: (builder: (tx: Transaction, pkg: typeof counterPackage) => void) => {
      const tx = new Transaction();
      builder(tx, counterPackage);
      return tx;
    },

    // Execute custom transaction
    useCustomTransaction: () => executeCustomTransaction,
  };
}

// Type exports for better TypeScript experience
export type CounterHookResult = ReturnType<typeof useCounter>;
export type OwnedCounterOperations = CounterHookResult["owned"];
export type SharedCounterOperations = CounterHookResult["shared"];
