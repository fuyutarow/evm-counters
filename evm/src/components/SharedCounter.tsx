"use client";

import { Copy, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCounter } from "@/hooks/useCounter";

interface SharedCounterProps {
  id: bigint;
}

export function SharedCounter({ id }: SharedCounterProps) {
  const [newValue, setNewValue] = useState<string>("");
  const counter = useCounter();
  const { data: count, refetch: refetchValue } = counter.shared.useValue(id);
  const { increment, setValue, isPending } = counter.shared;
  const { isConnected } = useAccount();

  const isAnyPending = isPending.increment || isPending.setValue;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  async function handleIncrement() {
    await increment(id);
    await refetchValue();
  }

  async function handleSetValue() {
    const value = Number.parseInt(newValue, 10);
    if (Number.isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    await setValue({ id, value: BigInt(value) });
    await refetchValue();
    setNewValue("");
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to interact with the Shared Counter
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Shared Counter #{id.toString()}</h1>
          <p className="text-muted-foreground">A counter that anyone can modify</p>
        </div>

        {/* Counter Display */}
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    Shared Counter #{id.toString()}
                    <Badge variant="outline" className="text-xs">
                      public
                    </Badge>
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground text-sm">Counter ID:</span>
                      <code className="font-mono text-muted-foreground text-xs">
                        {id.toString()}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => copyToClipboard(id.toString())}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-6xl">{count?.toString() ?? "0"}</div>
                  <div className="text-muted-foreground text-sm">current value</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controls */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Increment */}
                <div className="space-y-2">
                  <Button
                    onClick={handleIncrement}
                    disabled={isAnyPending}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Increment
                  </Button>
                </div>

                {/* Set Value */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="New value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      disabled={isAnyPending}
                    />
                    <Button
                      onClick={handleSetValue}
                      disabled={isAnyPending || !newValue}
                      size="default"
                    >
                      Set
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-blue-600">Public Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
