"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRight, Lock, Package } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { publicKey } = useWallet();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-lg bg-muted/50">
        {!publicKey ? (
          <div className="flex h-64 items-center justify-center">
            <h2 className="font-medium text-muted-foreground text-xl">
              Please connect your wallet
            </h2>
          </div>
        ) : (
          <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
            <div className="w-full max-w-4xl space-y-8">
              <div className="mb-12 text-center">
                <h1 className="mb-4 font-bold text-4xl">Welcome to Solana Counters</h1>
                <p className="text-muted-foreground text-xl">Choose your counter demo</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg">
                  <div className="mb-2 flex items-center gap-3">
                    <Package className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold text-xl">Owned Counter</h3>
                  </div>
                  <p className="mb-4 text-muted-foreground">
                    A counter that only the owner can modify
                  </p>
                  <ul className="mb-4 space-y-2 text-muted-foreground text-sm">
                    <li>• Owner-only increment</li>
                    <li>• Owner-only set value</li>
                    <li>• Personal counter</li>
                  </ul>
                  <Link
                    href="/owned-counter"
                    className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Try Owned Counter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-lg">
                  <div className="mb-2 flex items-center gap-3">
                    <Lock className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold text-xl">Shared Counter</h3>
                  </div>
                  <p className="mb-4 text-muted-foreground">A counter that anyone can increment</p>
                  <ul className="mb-4 space-y-2 text-muted-foreground text-sm">
                    <li>• Anyone can increment</li>
                    <li>• Creator can set value</li>
                    <li>• Shared collaboration</li>
                  </ul>
                  <Link
                    href="/shared-counter"
                    className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Try Shared Counter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
