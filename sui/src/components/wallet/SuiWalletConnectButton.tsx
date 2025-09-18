"use client";

import {
  ConnectButton,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, Copy as CopyIcon, ExternalLink, LogOut } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logger from "@/utils/logger";

export function SuiWalletConnectButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { currentWallet } = useCurrentWallet();

  // Note: Balance fetching removed as it's not currently displayed in UI
  // Can be re-added when balance display is implemented

  const copyAddressMutation = useMutation({
    mutationFn: async (address: string): Promise<void> => {
      await navigator.clipboard.writeText(address);
    },
    onSuccess: () => {
      toast.success("Address copied to clipboard");
    },
    onError: (error) => {
      logger.error("Failed to copy address", { error });
      toast.error("Failed to copy address");
    },
  });

  const copyAddressToClipboard = () => {
    if (account) {
      copyAddressMutation.mutate(account.address);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="w-full">
      {!account ? (
        <ConnectButton
          connectText={
            <span
              className="!opacity-100 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text font-extrabold text-transparent"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                opacity: 1,
                color: "transparent",
              }}
            >
              Connect Wallet
            </span>
          }
          className="!rounded-lg !px-4 !py-2 !text-sm !font-medium !bg-background !border !border-input hover:!bg-accent hover:!text-accent-foreground !transition-colors !cursor-pointer !outline-none !shadow-none !min-w-0 !min-h-0 !w-auto !h-auto !box-border !appearance-none !text-decoration-none !user-select-none"
        />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex h-10 min-w-[140px] cursor-pointer items-center rounded-lg bg-primary px-2 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/80">
                {currentWallet?.icon && (
                  <Image
                    src={currentWallet.icon}
                    alt={currentWallet.name}
                    width={20}
                    height={20}
                    className="h-6 w-6"
                  />
                )}
              </div>
              <span className="ml-2 flex-1 text-center font-medium text-primary-foreground text-sm">
                {formatAddress(account.address)}
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
                href={`https://testnet.suivision.xyz/account/${account.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md px-3 py-2 font-medium text-foreground text-sm hover:bg-accent focus:bg-accent"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span>Open in SuiVision</span>
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
