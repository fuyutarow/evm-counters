"use client";

import { Copy, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCounter } from "@/hooks/useCounter";

export default function SharedCounterPage() {
  const [newValue, setNewValue] = useState<string>("");
  const counter = useCounter();
  const { data: count } = counter.shared.useValue();
  const { increment, setValue, isPending } = counter.shared;
  const { isConnected } = useAccount();

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const isAnyPending = isPending.increment || isPending.setValue;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  async function handleSetValue() {
    const value = Number.parseInt(newValue, 10);
    if (Number.isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    await setValue(BigInt(value));
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

  if (!contractAddress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[500px] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Contract Not Configured</CardTitle>
              <CardDescription>
                Please set NEXT_PUBLIC_SHARED_COUNTER_ADDRESS in your environment variables
              </CardDescription>
            </CardHeader>
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
          <h1 className="font-bold text-3xl">Shared Counter</h1>
          <p className="text-muted-foreground">A counter that anyone can modify</p>
        </div>

        {/* Counter Display */}
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    Shared Counter
                    <Badge variant="default" className="text-xs">
                      public
                    </Badge>
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground text-sm">Contract:</span>
                      <code className="font-mono text-muted-foreground text-xs">
                        {contractAddress?.slice(0, 6)}...{contractAddress?.slice(-4)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => copyToClipboard(contractAddress ?? "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">Anyone can modify</span>
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
                    onClick={() => increment()}
                    disabled={isAnyPending}
                    className="w-full"
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Increment
                  </Button>
                  <p className="text-center text-muted-foreground text-xs">Anyone can increment</p>
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
                  <p className="text-center text-muted-foreground text-xs">Anyone can set value</p>
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
