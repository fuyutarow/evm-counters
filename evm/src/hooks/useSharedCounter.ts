import { useReadContract, useWriteContract } from "wagmi";
import { sharedCounterAbi } from "@/generated";

const SHARED_COUNTER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const;

export function useSharedCounter() {
  const { data: count, refetch: refetchCount } = useReadContract({
    address: SHARED_COUNTER_ADDRESS,
    abi: sharedCounterAbi,
    functionName: "count",
  });

  const { writeContract: increment, isPending: isIncrementPending } = useWriteContract();
  const { writeContract: setValue, isPending: isSetValuePending } = useWriteContract();

  const handleIncrement = () => {
    increment({
      address: SHARED_COUNTER_ADDRESS,
      abi: sharedCounterAbi,
      functionName: "increment",
    });
  };

  const handleSetValue = (newValue: bigint) => {
    setValue({
      address: SHARED_COUNTER_ADDRESS,
      abi: sharedCounterAbi,
      functionName: "setValue",
      args: [newValue],
    });
  };

  return {
    count: count ?? 0n,
    increment: handleIncrement,
    setValue: handleSetValue,
    isIncrementPending,
    isSetValuePending,
    refetchCount,
  };
}
