"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, Copy as CopyIcon, ExternalLink, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SolanaWalletConnectButton() {
  const { publicKey, disconnect, connected } = useWallet();

  const copyAddressMutation = useMutation({
    mutationFn: async (address: string): Promise<void> => {
      await navigator.clipboard.writeText(address);
    },
    onSuccess: () => {
      toast.success("Address copied to clipboard");
    },
    onError: () => {
      toast.error("Failed to copy address");
    },
  });

  const copyAddressToClipboard = () => {
    if (publicKey) {
      copyAddressMutation.mutate(publicKey.toString());
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="w-full">
      {!connected ? (
        <WalletMultiButton
          style={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--input))",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "hsl(var(--foreground))",
            height: "auto",
            minWidth: "auto",
          }}
        />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex h-10 min-w-[140px] cursor-pointer items-center rounded-lg bg-primary px-2 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/80">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
              </div>
              <span className="ml-2 flex-1 text-center font-medium text-primary-foreground text-sm">
                {publicKey && formatAddress(publicKey.toString())}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0 text-primary-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-50 mt-2 w-[220px] rounded-md border border-border bg-background/95 p-1 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <DropdownMenuItem
              onClick={copyAddressToClipboard}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 font-medium text-foreground text-sm transition hover:bg-accent focus:bg-accent"
            >
              <CopyIcon className="h-4 w-4 text-muted-foreground" />
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={`https://explorer.solana.com/address/${publicKey?.toString()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md px-3 py-2 font-medium text-foreground text-sm hover:bg-accent focus:bg-accent"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span>Open in Explorer</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDisconnect}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 font-medium text-destructive text-sm transition hover:bg-destructive/10 focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 text-destructive" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
