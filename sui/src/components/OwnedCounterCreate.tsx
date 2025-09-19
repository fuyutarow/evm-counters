"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCounter } from "@/hooks/useCounter";

export function OwnedCounterCreate({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const counter = useCounter();

  const isCreatingOwned = counter.owned.isPending.create;

  function handleCreateOwned() {
    counter.owned.create().then((counterId) => {
      onSuccess?.();
      router.push(`/owned-counter/${counterId}`);
    });
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Owned Counter</CardTitle>
          <CardDescription>
            Create a personal counter that only you can access and modify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            onClick={handleCreateOwned}
            disabled={isCreatingOwned}
            className="w-full"
          >
            {isCreatingOwned ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Owned Counter"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
