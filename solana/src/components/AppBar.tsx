"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { SolanaWalletConnectButton } from "@/components/wallet/SolanaWalletConnectButton";

export function AppBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <h1 className="font-semibold text-lg">Solana Counters</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/owned-counter"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              Owned Counter
            </Link>
            <Link
              href="/shared-counter"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              Shared Counter
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer">
              Faucet
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          <ModeToggle />
          <SolanaWalletConnectButton />
        </div>
      </div>
    </header>
  );
}
