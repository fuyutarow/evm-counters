"use client";

import { Wallet } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { AccountMenu } from "@/components/AccountMenu";
import { Button } from "@/components/ui/button";
import { WalletModal } from "@/components/WalletModal";

export function ConnectButton() {
  const { isConnected } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnected) {
    return <AccountMenu />;
  }

  return (
    <>
      <Button variant="default" size="sm" onClick={() => setModalOpen(true)} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
      <WalletModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
