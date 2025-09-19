import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AppBar } from "@/components/AppBar";
import { Providers } from "./providers";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana Counters - Anchor Smart Contract Demo",
  description: "Counter smart contracts demo on Solana blockchain using Anchor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <AppBar />
            <main>{children}</main>
          </div>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
