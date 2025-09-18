"use client";

import { ExternalLink } from "lucide-react";
import { CounterDisplay } from "@/components/CounterDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { useCounter, useSharedCounterValue } from "@/hooks/useCounter";

interface SharedCounterProps {
  id: string;
}

export function SharedCounter({ id }: SharedCounterProps) {
  const counter = useCounter();

  // Type-safe data fetching for shared counters only
  const { data, isLoading, error, refetch } = useSharedCounterValue(id);

  // Shared counter operations
  const isIncrementing = counter.shared.isPending.increment;
  const isSettingValue = counter.shared.isPending.setValue;

  const handleIncrement = async () => {
    await counter.shared.increment(id);
    refetch();
  };

  const handleSetValue = async (value: number) => {
    await counter.shared.setValue({ counterId: id, value });
    refetch();
  };

  const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  // Handle the case where data is null but no error occurred
  const hasDataIssue = !isLoading && !error && !data;

  if (hasDataIssue) {
    return (
      <div className="flex justify-center pt-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-amber-600">
              <p className="font-semibold">Object Data Unavailable</p>
              <p className="mt-2 text-sm">
                This counter exists on the network but cannot be read with the current program
                configuration. It may have been created with an older version of the contract.
              </p>
              <p className="mt-4 text-muted-foreground text-xs">Counter ID: {formatAddress(id)}</p>
              <div className="mt-4">
                <a
                  href={`https://explorer.solana.com/address/${id}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 text-blue-500 text-sm hover:text-blue-700"
                >
                  View on Solana Explorer <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CounterDisplay
      id={id}
      title="Shared Counter"
      value={data?.value ?? ""}
      isLoading={isLoading}
      isIncrementing={isIncrementing}
      isSettingValue={isSettingValue}
      onIncrement={handleIncrement}
      onSetValue={handleSetValue}
      error={error}
    />
  );
}
