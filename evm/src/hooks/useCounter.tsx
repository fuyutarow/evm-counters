/**
 * Counter contracts unified hook
 * - owned_counter: Personal owned counter
 * - shared_counter: Shared public counter
 *
 * React hooks rules compliant design
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ownedCounterAbi, sharedCounterAbi } from "@/generated";

const OWNED_COUNTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;
const SHARED_COUNTER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const;

// ================== Explorer Link Builder ==================
const buildExplorerLink = (hash: string): string => {
  // For Anvil (local development)
  if (window.location.hostname === "localhost") {
    return `https://anvil.local/tx/${hash}`;
  }

  // For Sepolia testnet
  return `https://sepolia.etherscan.io/tx/${hash}`;
};

const showTxSuccessToast = (message: string, hash: string) => {
  toast.success(message, {
    description: (
      <a
        href={buildExplorerLink(hash)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        View transaction on Etherscan
      </a>
    ),
  });
};

// ================== Counter Value Query Hooks ==================
export function useOwnedCounterValue() {
  return useReadContract({
    address: OWNED_COUNTER_ADDRESS,
    abi: ownedCounterAbi,
    functionName: "count",
  });
}

export function useOwnedCounterOwner() {
  return useReadContract({
    address: OWNED_COUNTER_ADDRESS,
    abi: ownedCounterAbi,
    functionName: "owner",
  });
}

export function useSharedCounterValue() {
  return useReadContract({
    address: SHARED_COUNTER_ADDRESS,
    abi: sharedCounterAbi,
    functionName: "count",
  });
}

// ================== Main Counter Hook ==================
export function useCounter() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const { writeContract } = useWriteContract();

  // ================== Owned Counter Operations ==================
  const incrementOwnedCounter = useMutation({
    mutationKey: ["counter", "owned", "increment"],
    mutationFn: async (): Promise<`0x${string}`> => {
      return new Promise((resolve, reject) => {
        writeContract(
          {
            address: OWNED_COUNTER_ADDRESS,
            abi: ownedCounterAbi,
            functionName: "increment",
          },
          {
            onSuccess: (hash) => {
              resolve(hash);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      });
    },
    onSuccess: (hash) => {
      showTxSuccessToast("Counter incremented successfully!", hash);
      queryClient.invalidateQueries({ queryKey: ["owned-counter"] });
    },
    onError: (error) => {
      toast.error("Failed to increment counter", {
        description: error.message,
      });
    },
  });

  const setOwnedCounterValue = useMutation({
    mutationKey: ["counter", "owned", "setValue"],
    mutationFn: async (value: bigint): Promise<`0x${string}`> => {
      return new Promise((resolve, reject) => {
        writeContract(
          {
            address: OWNED_COUNTER_ADDRESS,
            abi: ownedCounterAbi,
            functionName: "setValue",
            args: [value],
          },
          {
            onSuccess: (hash) => {
              resolve(hash);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      });
    },
    onSuccess: (hash, value) => {
      showTxSuccessToast(`Counter set to ${value}!`, hash);
      queryClient.invalidateQueries({ queryKey: ["owned-counter"] });
    },
    onError: (error) => {
      toast.error("Failed to set counter value", {
        description: error.message,
      });
    },
  });

  // ================== Shared Counter Operations ==================
  const incrementSharedCounter = useMutation({
    mutationKey: ["counter", "shared", "increment"],
    mutationFn: async (): Promise<`0x${string}`> => {
      return new Promise((resolve, reject) => {
        writeContract(
          {
            address: SHARED_COUNTER_ADDRESS,
            abi: sharedCounterAbi,
            functionName: "increment",
          },
          {
            onSuccess: (hash) => {
              resolve(hash);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      });
    },
    onSuccess: (hash) => {
      showTxSuccessToast("Shared counter incremented successfully!", hash);
      queryClient.invalidateQueries({ queryKey: ["shared-counter"] });
    },
    onError: (error) => {
      toast.error("Failed to increment shared counter", {
        description: error.message,
      });
    },
  });

  const setSharedCounterValue = useMutation({
    mutationKey: ["counter", "shared", "setValue"],
    mutationFn: async (value: bigint): Promise<`0x${string}`> => {
      return new Promise((resolve, reject) => {
        writeContract(
          {
            address: SHARED_COUNTER_ADDRESS,
            abi: sharedCounterAbi,
            functionName: "setValue",
            args: [value],
          },
          {
            onSuccess: (hash) => {
              resolve(hash);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      });
    },
    onSuccess: (hash, value) => {
      showTxSuccessToast(`Shared counter set to ${value}!`, hash);
      queryClient.invalidateQueries({ queryKey: ["shared-counter"] });
    },
    onError: (error) => {
      toast.error("Failed to set shared counter value", {
        description: error.message,
      });
    },
  });

  // ================== Utility Functions ==================
  const ownedCounterOwner = useOwnedCounterOwner();
  const isOwner =
    address && ownedCounterOwner.data
      ? address.toLowerCase() === ownedCounterOwner.data.toLowerCase()
      : false;

  // ================== Unified API ==================
  return {
    owned: {
      useValue: useOwnedCounterValue,
      useOwner: useOwnedCounterOwner,
      increment: incrementOwnedCounter.mutateAsync,
      setValue: setOwnedCounterValue.mutateAsync,
      isOwner,
      isPending: {
        increment: incrementOwnedCounter.isPending,
        setValue: setOwnedCounterValue.isPending,
      },
    },
    shared: {
      useValue: useSharedCounterValue,
      increment: incrementSharedCounter.mutateAsync,
      setValue: setSharedCounterValue.mutateAsync,
      isPending: {
        increment: incrementSharedCounter.isPending,
        setValue: setSharedCounterValue.isPending,
      },
    },
  };
}

// Type exports for better TypeScript experience
export type CounterHookResult = ReturnType<typeof useCounter>;
export type OwnedCounterOperations = CounterHookResult["owned"];
export type SharedCounterOperations = CounterHookResult["shared"];
