"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { coinbaseWallet, injected, walletConnect } from "@wagmi/connectors";
import { createConfig, http, WagmiProvider } from "wagmi";
import { anvil, arbitrum, mainnet, polygon, sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

export const wagmiConfig = createConfig({
  chains: [anvil, mainnet, sepolia, arbitrum, polygon],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "EVM Counters",
      appLogoUrl: "https://evm-counters.example.com/icon.png",
    }),
    walletConnect({
      projectId,
      metadata: {
        name: "EVM Counters",
        description: "Owned and Shared Counter dApp",
        url: "https://evm-counters.example.com",
        icons: ["https://evm-counters.example.com/icon.png"],
      },
    }),
  ],
  transports: {
    [anvil.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
