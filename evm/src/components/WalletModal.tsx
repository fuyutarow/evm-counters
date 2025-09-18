"use client";

import { Loader2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Connector, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function WalletOption({ connector, onClick }: { connector: Connector; onClick: () => void }) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  const getConnectorIcon = (name: string) => {
    const normalizedName = name.toLowerCase();
    if (normalizedName.includes("metamask")) return "🦊";
    if (normalizedName.includes("walletconnect")) return "🔗";
    if (normalizedName.includes("coinbase")) return "🔵";
    if (normalizedName.includes("injected")) return "💉";
    return "👛";
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="h-16 w-full justify-start gap-3 p-4"
      disabled={!ready || loading}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <span className="text-2xl">{getConnectorIcon(connector.name)}</span>
      )}
      <div className="flex flex-col items-start">
        <span className="font-medium">{connector.name}</span>
        {!ready && <span className="text-muted-foreground text-xs">Not available</span>}
      </div>
    </Button>
  );
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { connectors, connect } = useConnect();

  const handleConnect = async (connector: Connector) => {
    try {
      await connect({ connector });
      onOpenChange(false);
      toast.success(`Connected to ${connector.name}`);
    } catch (_error) {
      toast.error(`Failed to connect to ${connector.name}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>Choose a wallet to connect to your account</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          {connectors.map((connector) => (
            <WalletOption
              key={connector.uid}
              connector={connector}
              onClick={() => handleConnect(connector)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
