"use client";

import { createAppKit } from "@reown/appkit";
import { type AppKitNetwork } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { anvil, arbitrum, mainnet, polygon, sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "demo-project-id";
const networks = [anvil, mainnet, sepolia, arbitrum, polygon] satisfies [
  AppKitNetwork,
  ...AppKitNetwork[],
];

// ✅ AppKit主導で「接続UX／セッション」を握る
const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

// wagmi は「Reactフック層」だけに限定
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// AppKit（接続モーダル等）を起動
createAppKit({
  // @ts-expect-error - Reown AppKit library is not compatible with exactOptionalPropertyTypes: true
  adapters: [wagmiAdapter],
  projectId,
  networks,
  features: {
    email: false,
  },
  metadata: {
    name: "EVM Counters",
    description: "Owned and Shared Counter dApp",
    url: "https://evm-counters.example.com",
    icons: ["https://evm-counters.example.com/icon.png"],
  },
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
