"use client";

import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOwnedCountersList } from "@/hooks/useCounter";

export function OwnedCountersList() {
  const router = useRouter();
  const { data: counters, isLoading, error } = useOwnedCountersList();

  const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-2 font-medium text-lg text-muted-foreground">
            Failed to load owned counters
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!counters || counters.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-2 font-medium text-lg text-muted-foreground">No owned counters found</p>
          <p className="text-muted-foreground text-sm">Create your first counter above!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-xl">Your Owned Counters ({counters.length})</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {counters.map((counter) => (
          <Card key={counter.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="text-lg">Owned Counter</CardTitle>
                  <div className="flex items-center space-x-2">
                    <code className="font-mono text-muted-foreground text-xs">
                      {formatAddress(counter.id)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => copyToClipboard(counter.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-bold text-2xl">
                  {counter.value}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                  Owner: {formatAddress(counter.owner)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/owned-counter/${counter.id}`)}
                  className="flex items-center space-x-1"
                >
                  <span>Open</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
