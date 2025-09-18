"use client";

import { ArrowRight, Lock, Package } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-muted/50">
        <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
          <div className="w-full max-w-4xl space-y-8">
            <div className="mb-12 text-center">
              <h1 className="mb-4 font-bold text-4xl">EVM Counters</h1>
              <p className="text-muted-foreground text-xl">
                Owned and Shared Counter dApps on Ethereum
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <Lock className="h-8 w-8 text-primary" />
                    <CardTitle>Owned Counter</CardTitle>
                  </div>
                  <CardDescription>
                    A private counter that only the owner can modify
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-4 space-y-2 text-muted-foreground text-sm">
                    <li>• Owner-only access control</li>
                    <li>• Increment and set value</li>
                    <li>• On-chain ownership verification</li>
                  </ul>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/owned-counter">
                      Try Owned Counter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <Package className="h-8 w-8 text-primary" />
                    <CardTitle>Shared Counter</CardTitle>
                  </div>
                  <CardDescription>A public counter that anyone can modify</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-4 space-y-2 text-muted-foreground text-sm">
                    <li>• Public access for all users</li>
                    <li>• Anyone can increment or set value</li>
                    <li>• Real-time collaboration</li>
                  </ul>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/shared-counter">
                      Try Shared Counter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
