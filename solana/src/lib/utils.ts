import { getAddressEncoder, getProgramDerivedAddress } from "@solana/addresses";
import { type Address } from "@solana/kit";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// PDA derivation utilities for owned counter
export async function getUserMetaPDA(
  owner: Address,
  programId: Address,
): Promise<[Address, number]> {
  const addressEncoder = getAddressEncoder();
  const [pda, bump] = await getProgramDerivedAddress({
    programAddress: programId,
    seeds: [new TextEncoder().encode("user_meta"), addressEncoder.encode(owner)],
  });
  return [pda, bump];
}

export async function getOwnedCounterPDA(
  owner: Address,
  index: number,
  programId: Address,
): Promise<[Address, number]> {
  const addressEncoder = getAddressEncoder();
  const indexBuffer = new Uint8Array(8);
  new DataView(indexBuffer.buffer).setBigUint64(0, BigInt(index), true);

  const [pda, bump] = await getProgramDerivedAddress({
    programAddress: programId,
    seeds: [new TextEncoder().encode("counter"), addressEncoder.encode(owner), indexBuffer],
  });
  return [pda, bump];
}

// PDA derivation utilities for shared counter
export async function getSharedCounterRegistryPDA(programId: Address): Promise<[Address, number]> {
  const [pda, bump] = await getProgramDerivedAddress({
    programAddress: programId,
    seeds: [new TextEncoder().encode("shared_registry")],
  });
  return [pda, bump];
}

export async function getSharedCounterPDA(
  id: number,
  programId: Address,
): Promise<[Address, number]> {
  const idBuffer = new Uint8Array(8);
  new DataView(idBuffer.buffer).setBigUint64(0, BigInt(id), true);

  const [pda, bump] = await getProgramDerivedAddress({
    programAddress: programId,
    seeds: [new TextEncoder().encode("shared"), idBuffer],
  });
  return [pda, bump];
}
