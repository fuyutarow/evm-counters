"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSharedCountersList } from "@/hooks/useCounter";

export function SharedCountersList() {
  const { data: counters, isLoading, error } = useSharedCountersList();

  const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Shared Counters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Shared Counters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">Failed to load shared counters</p>
        </CardContent>
      </Card>
    );
  }

  if (!counters || counters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Shared Counters</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No shared counters found. Create the first shared counter above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Shared Counters ({counters.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {counters.map((counter) => (
            <div
              key={counter.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{formatAddress(counter.id)}</Badge>
                  <span className="font-mono font-semibold text-lg">{counter.value}</span>
                </div>
                <p className="text-muted-foreground text-sm">ID: {counter.seed}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/shared-counter/${counter.id}`}>View Details</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={`https://explorer.solana.com/address/${counter.id}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
