"use client";

import * as anchor from "@coral-xyz/anchor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProgram } from "./useProgram";

const _buildExplorerLink = (signature: string): string =>
  `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

const showTxSuccessToast = (message: string, signature: string) => {
  toast.success(message, {
    description: `View transaction: ${_buildExplorerLink(signature)}`,
  });
};

// ================== Counter Value Query Hook ==================
export function useCounterValue(counterId?: string, type: "owned" | "shared" = "owned") {
  const { ownedCounterProgram, sharedCounterProgram } = useProgram();

  return useQuery({
    queryKey: ["counter", type, counterId],
    queryFn: async () => {
      if (!counterId) return null;

      try {
        if (type === "owned" && ownedCounterProgram) {
          const counterPubkey = new anchor.web3.PublicKey(counterId);
          const account = await ownedCounterProgram.account.ownedCounter.fetch(counterPubkey);
          if (!account) throw new Error("Failed to fetch owned counter account");

          return {
            id: counterId,
            value: account.value.toString(),
            owner: account.owner.toString(),
            creator: undefined,
            seed: account.seed.toString(),
            type,
          };
        }
        if (type === "shared" && sharedCounterProgram) {
          const counterPubkey = new anchor.web3.PublicKey(counterId);
          const account = await sharedCounterProgram.account.sharedCounter.fetch(counterPubkey);
          if (!account) throw new Error("Failed to fetch shared counter account");

          return {
            id: counterId,
            value: account.value.toString(),
            owner: undefined,
            seed: account.id.toString(),
            type,
          };
        }

        return null;
      } catch (_error) {
        return null;
      }
    },
    enabled: !!counterId && !!(type === "owned" ? ownedCounterProgram : sharedCounterProgram),
  });
}

// ================== Main Counter Hook ==================
export function useCounter() {
  const { ownedCounterProgram, sharedCounterProgram, publicKey } = useProgram();
  const queryClient = useQueryClient();

  // ================== Owned Counter Operations ==================
  const createOwnedCounter = useMutation({
    mutationKey: ["counter", "owned", "create"],
    mutationFn: async (): Promise<string> => {
      if (!ownedCounterProgram || !publicKey) {
        throw new Error("Program or wallet not available");
      }

      // Generate a random seed and counter keypair
      const seed = Math.floor(Math.random() * 1000000);
      const seedBN = new anchor.BN(seed);
      const counterKeypair = anchor.web3.Keypair.generate();

      const signature = await ownedCounterProgram.methods
        .create(seedBN)
        .accountsPartial({
          counter: counterKeypair.publicKey,
          owner: publicKey,
        })
        .signers([counterKeypair])
        .rpc();

      showTxSuccessToast("Owned counter created successfully!", signature);
      await queryClient.invalidateQueries({ queryKey: ["owned-counters"] });

      return counterKeypair.publicKey.toString();
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
      if (!ownedCounterProgram || !publicKey) {
        throw new Error("Program or wallet not available");
      }

      const signature = await ownedCounterProgram.methods
        .increment()
        .accountsPartial({
          counter: new anchor.web3.PublicKey(counterId),
          owner: publicKey,
        })
        .rpc();

      showTxSuccessToast("Counter incremented successfully!", signature);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["counter", "owned", counterId] }),
        queryClient.invalidateQueries({ queryKey: ["owned-counters"] }),
      ]);
    },
    onError: (error) => {
      toast.error("Failed to increment counter", {
        description: error.message,
      });
    },
  });

  const setOwnedCounterValue = useMutation({
    mutationKey: ["counter", "owned", "setValue"],
    mutationFn: async (params: { counterId: string; value: number }): Promise<void> => {
      if (!ownedCounterProgram || !publicKey) {
        throw new Error("Program or wallet not available");
      }

      const signature = await ownedCounterProgram.methods
        .setValue(new anchor.BN(params.value))
        .accountsPartial({
          counter: new anchor.web3.PublicKey(params.counterId),
          owner: publicKey,
        })
        .rpc();

      showTxSuccessToast(`Counter set to ${params.value}!`, signature);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["counter", "owned", params.counterId] }),
        queryClient.invalidateQueries({ queryKey: ["owned-counters"] }),
      ]);
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
      if (!sharedCounterProgram || !publicKey) {
        throw new Error("Program or wallet not available");
      }

      // Generate counter keypair and get registry PDA
      const counterKeypair = anchor.web3.Keypair.generate();
      const [registryPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("shared_registry")],
        sharedCounterProgram.programId,
      );

      const signature = await sharedCounterProgram.methods
        .create()
        .accountsPartial({
          counter: counterKeypair.publicKey,
          creator: publicKey,
          payer: publicKey,
          registry: registryPda,
        })
        .signers([counterKeypair])
        .rpc();

      showTxSuccessToast("Shared counter created successfully!", signature);
      await queryClient.invalidateQueries({ queryKey: ["shared-counters"] });

      return counterKeypair.publicKey.toString();
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
      if (!sharedCounterProgram || !publicKey) {
        throw new Error("Program or wallet not available");
      }

      const signature = await sharedCounterProgram.methods
        .increment()
        .accountsPartial({
          counter: new anchor.web3.PublicKey(counterId),
          caller: publicKey,
        })
        .rpc();

      showTxSuccessToast("Shared counter incremented successfully!", signature);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["counter", "shared", counterId] }),
        queryClient.invalidateQueries({ queryKey: ["shared-counters"] }),
      ]);
    },
    onError: (error) => {
      toast.error("Failed to increment shared counter", {
        description: error.message,
      });
    },
  });

  const setSharedCounterValue = useMutation({
    mutationKey: ["counter", "shared", "setValue"],
    mutationFn: async (params: { counterId: string; value: number }): Promise<void> => {
      if (!sharedCounterProgram || !publicKey) {
        throw new Error("Program or wallet not available");
      }

      const signature = await sharedCounterProgram.methods
        .setValue(new anchor.BN(params.value))
        .accountsPartial({
          counter: new anchor.web3.PublicKey(params.counterId),
          caller: publicKey,
        })
        .rpc();

      showTxSuccessToast(`Shared counter set to ${params.value}!`, signature);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["counter", "shared", params.counterId] }),
        queryClient.invalidateQueries({ queryKey: ["shared-counters"] }),
      ]);
    },
    onError: (error) => {
      toast.error("Failed to set shared counter value", {
        description: error.message,
      });
    },
  });

  // ================== Unified API ==================
  return {
    owned: {
      create: createOwnedCounter.mutateAsync,
      increment: incrementOwnedCounter.mutateAsync,
      setValue: setOwnedCounterValue.mutateAsync,
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
      isPending: {
        create: createSharedCounter.isPending,
        increment: incrementSharedCounter.isPending,
        setValue: setSharedCounterValue.isPending,
      },
    },
  };
}

// ================== Convenience Hooks ==================
export const useOwnedCounterValue = (counterId?: string) => useCounterValue(counterId, "owned");
export const useSharedCounterValue = (counterId?: string) => useCounterValue(counterId, "shared");

// Type exports for better TypeScript experience
export type CounterHookResult = ReturnType<typeof useCounter>;
export type OwnedCounterOperations = CounterHookResult["owned"];
export type SharedCounterOperations = CounterHookResult["shared"];
