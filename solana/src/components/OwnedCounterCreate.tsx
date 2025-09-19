"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCounter } from "@/hooks/useCounter";
import { useProgram } from "@/hooks/useProgram";

export function OwnedCounterCreate() {
  const router = useRouter();
  const counter = useCounter();
  const { isConnected } = useProgram();

  const isCreating = counter.owned.isPending.create;

  const handleCreate = async () => {
    try {
      const counterId = await counter.owned.create();
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
          <p className="text-muted-foreground text-sm">
            Create a new personal counter that only you can manage. A unique address will be
            automatically generated.
          </p>
        </div>

        <Button onClick={handleCreate} disabled={isCreating} className="w-full">
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
