import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ownedCounterAbi } from "@/generated";

const OWNED_COUNTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

export function useOwnedCounter() {
  const { address } = useAccount();

  const { data: count, refetch: refetchCount } = useReadContract({
    address: OWNED_COUNTER_ADDRESS,
    abi: ownedCounterAbi,
    functionName: "count",
  });

  const { data: owner } = useReadContract({
    address: OWNED_COUNTER_ADDRESS,
    abi: ownedCounterAbi,
    functionName: "owner",
  });

  const { writeContract: increment, isPending: isIncrementPending } = useWriteContract();
  const { writeContract: setValue, isPending: isSetValuePending } = useWriteContract();

  const handleIncrement = () => {
    increment({
      address: OWNED_COUNTER_ADDRESS,
      abi: ownedCounterAbi,
      functionName: "increment",
    });
  };

  const handleSetValue = (newValue: bigint) => {
    setValue({
      address: OWNED_COUNTER_ADDRESS,
      abi: ownedCounterAbi,
      functionName: "setValue",
      args: [newValue],
    });
  };

  const isOwner = address && owner ? address.toLowerCase() === owner.toLowerCase() : false;

  return {
    count: count ?? 0n,
    owner,
    isOwner,
    increment: handleIncrement,
    setValue: handleSetValue,
    isIncrementPending,
    isSetValuePending,
    refetchCount,
  };
}
