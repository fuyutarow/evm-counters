"use client";

import { Copy, ExternalLink, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu() {
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName ?? undefined });

  if (!address) return null;

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const getExplorerUrl = (address: string) => {
    if (chain?.blockExplorers?.default?.url) {
      return `${chain.blockExplorers.default.url}/address/${address}`;
    }
    return `https://etherscan.io/address/${address}`;
  };

  const displayName = ensName || `${address.slice(0, 6)}...${address.slice(-4)}`;
  const fullAddress = address;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 px-2">
          <Avatar className="h-6 w-6">
            {ensAvatar && <AvatarImage src={ensAvatar} alt="ENS Avatar" />}
            <AvatarFallback>
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span>Account</span>
          {ensName && <span className="font-normal text-muted-foreground text-sm">{ensName}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => copyToClipboard(fullAddress, "Address copied!")}
          className="cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={getExplorerUrl(fullAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => disconnect()}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
