"use client";

import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { type OwnedCounter } from "../idl/owned_counter";
import ownedCounterIdl from "../idl/owned_counter.json";
import { type SharedCounter } from "../idl/shared_counter";
import sharedCounterIdl from "../idl/shared_counter.json";

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    return new anchor.AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      { preflightCommitment: "processed" },
    );
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  const ownedCounterProgram = useMemo(() => {
    if (!provider) return null;

    return new anchor.Program<OwnedCounter>(ownedCounterIdl as anchor.Idl, provider);
  }, [provider]);

  const sharedCounterProgram = useMemo(() => {
    if (!provider) return null;

    return new anchor.Program<SharedCounter>(sharedCounterIdl as anchor.Idl, provider);
  }, [provider]);

  return {
    provider,
    ownedCounterProgram,
    sharedCounterProgram,
    isConnected: !!wallet.connected,
    publicKey: wallet.publicKey,
  };
}
