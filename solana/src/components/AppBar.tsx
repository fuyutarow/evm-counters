"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { SolanaWalletConnectButton } from "@/components/wallet/SolanaWalletConnectButton";

export function AppBar() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const airdropMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);

      await connection.confirmTransaction(signature, "confirmed");
    },
    onSuccess: () => {
      toast.success("Airdrop successful! 1 SOL added to your wallet");
    },
    onError: (_error) => {
      toast.error("Airdrop failed. Make sure local validator is running");
    },
  });

  const handleAirdrop = () => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    airdropMutation.mutate();
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={handleAirdrop}
            disabled={!publicKey || airdropMutation.isPending}
          >
            {airdropMutation.isPending ? "Airdropping..." : "Get 1 SOL"}
          </Button>
          <ModeToggle />
          <SolanaWalletConnectButton />
        </div>
      </div>
    </header>
  );
}
