"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CounterDisplayProps {
  id: string;
  title: string;
  value: string;
  isLoading: boolean;
  isIncrementing: boolean;
  isSettingValue: boolean;
  onIncrement: () => Promise<void>;
  onSetValue: (value: number) => Promise<void>;
  error?: Error | null;
  owner?: string;
  creator?: string;
}

export function CounterDisplay({
  id,
  title,
  value,
  isLoading,
  isIncrementing,
  isSettingValue,
  onIncrement,
  onSetValue,
  error,
  owner,
  creator,
}: CounterDisplayProps) {
  const [newValue, setNewValue] = useState("");
  const inputId = useId();

  const handleSetValue = async () => {
    const val = Number.parseInt(newValue, 10);
    if (Number.isNaN(val) || val < 0) {
      return;
    }
    await onSetValue(val);
    setNewValue("");
  };

  const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  if (isLoading) {
    return (
      <div className="flex justify-center pt-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center pt-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>Failed to load counter data: {error.message}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-center">{title}</CardTitle>
          <p className="text-center text-muted-foreground text-sm">ID: {formatAddress(id)}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counter Value Display */}
          <div className="text-center">
            <div className="font-bold text-4xl text-primary">{value}</div>
            <p className="text-muted-foreground text-sm">Current Value</p>
          </div>

          {/* Owner/Creator Info */}
          {(owner || creator) && (
            <div className="text-center text-muted-foreground text-sm">
              {owner && <p>Owner: {formatAddress(owner)}</p>}
              {creator && <p>Creator: {formatAddress(creator)}</p>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button onClick={onIncrement} disabled={isIncrementing} className="w-full">
              {isIncrementing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Incrementing...
                </>
              ) : (
                "Increment (+1)"
              )}
            </Button>

            {/* Set Value Section */}
            <div className="space-y-2">
              <Label htmlFor={inputId}>Set New Value</Label>
              <div className="flex gap-2">
                <Input
                  id={inputId}
                  type="number"
                  placeholder="Enter new value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={isSettingValue}
                  min="0"
                />
                <Button onClick={handleSetValue} disabled={isSettingValue || !newValue}>
                  {isSettingValue ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set"}
                </Button>
              </div>
            </div>
          </div>

          {/* Explorer Link */}
          <div className="text-center">
            <a
              href={`https://explorer.solana.com/address/${id}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-blue-500 text-sm hover:text-blue-700"
            >
              View on Solana Explorer <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
