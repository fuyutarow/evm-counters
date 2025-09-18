"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCounter } from "@/hooks/useCounter";
import { useProgram } from "@/hooks/useProgram";

export function OwnedCounterCreate() {
  const [seed, setSeed] = useState("");
  const router = useRouter();
  const counter = useCounter();
  const { isConnected } = useProgram();
  const seedInputId = useId();

  const isCreating = counter.owned.isPending.create;

  const handleCreate = async () => {
    if (!seed.trim()) return;

    const seedNumber = Number.parseInt(seed, 10);
    if (Number.isNaN(seedNumber) || seedNumber < 0) return;

    try {
      const counterId = await counter.owned.create(seedNumber);
      setSeed("");
      router.push(`/owned-counter/${counterId}`);
    } catch (_error) {}
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Please connect your wallet to create a counter</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Owned Counter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={seedInputId}>Seed (Unique ID)</Label>
          <Input
            id={seedInputId}
            type="number"
            placeholder="Enter a unique seed number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            disabled={isCreating}
            min="0"
          />
          <p className="text-muted-foreground text-sm">
            Each counter needs a unique seed number to generate its address
          </p>
        </div>

        <Button onClick={handleCreate} disabled={isCreating || !seed.trim()} className="w-full">
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Counter...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Owned Counter
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
