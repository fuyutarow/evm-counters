"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/theme-provider";

const Web3Providers = dynamic(
  () => import("@/lib/web3").then((mod) => ({ default: mod.Web3Providers })),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Web3Providers>{children}</Web3Providers>
    </ThemeProvider>
  );
}
