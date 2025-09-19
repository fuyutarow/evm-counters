"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCounter } from "@/hooks/useCounter";

export function SharedCounterCreate({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const counter = useCounter();

  const isCreatingShared = counter.shared.isPending.create;

  function handleCreateShared() {
    counter.shared.create().then((counterId) => {
      onSuccess?.();
      router.push(`/shared-counter/${counterId}`);
    });
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Shared Counter</CardTitle>
          <CardDescription>
            Create a shared counter that anyone can increment, but only you can set values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            onClick={handleCreateShared}
            disabled={isCreatingShared}
            className="w-full"
          >
            {isCreatingShared ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Shared Counter"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
