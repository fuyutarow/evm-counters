"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    if (network === WalletAdapterNetwork.Devnet) {
      return "https://api.devnet.solana.com";
    }
    return "https://api.mainnet-beta.solana.com";
  }, [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
