import { PublicKey } from "@solana/web3.js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// PDA derivation utilities for owned counter
export function getUserMetaPDA(owner: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("user_meta"), owner.toBuffer()], programId);
}

export function getOwnedCounterPDA(
  owner: PublicKey,
  index: number,
  programId: PublicKey,
): [PublicKey, number] {
  const indexBuffer = Buffer.alloc(8);
  indexBuffer.writeBigUInt64LE(BigInt(index), 0);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), owner.toBuffer(), indexBuffer],
    programId,
  );
}

// PDA derivation utilities for shared counter
export function getSharedCounterRegistryPDA(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("shared_registry")], programId);
}

export function getSharedCounterPDA(id: number, programId: PublicKey): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8);
  idBuffer.writeBigUInt64LE(BigInt(id), 0);

  return PublicKey.findProgramAddressSync([Buffer.from("shared"), idBuffer], programId);
}
