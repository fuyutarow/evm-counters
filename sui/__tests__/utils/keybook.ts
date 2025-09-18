#!/usr/bin/env tsx

/**
 * Keybook utility for accessing Sui keypairs from the local configuration
 * Reads from ~/.sui/sui_config/sui.keystore and ~/.sui/sui_config/sui.aliases
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

// Known addresses for convenience
export const KNOWN_ADDRESSES = {
  alice: "0x2171fd4369dd716443684d5de72f7dfb7605fc4a763a5a8bdbb5efa749555c00",
  bob: "0x0bcef15674c39355762431d1f0082d6343fa112532afd6bbd711dcebfd9b8dd6",
  PRIME: "0x50e77137cc4501330fa0096be9363662c360813885bf74d44b2669ba6bc28e42",
  carol: "0x50e77137cc4501330fa0096be9363662c360813885bf74d44b2669ba6bc28e42", // Same as PRIME
} as const;

interface KeyAlias {
  alias: string;
  public_key_base64: string;
}

export interface KeyInfo {
  alias: string;
  address: string;
  publicKey: string;
  privateKey: string;
  keypair: Ed25519Keypair;
}

/**
 * Get the Sui config directory path
 */
function getSuiConfigDir(): string {
  return join(process.env.HOME || "", ".sui", "sui_config");
}

/**
 * Load all keypairs from the Sui configuration
 */
export function loadKeybook(): Record<string, KeyInfo> {
  const configDir = getSuiConfigDir();
  const keystorePath = join(configDir, "sui.keystore");
  const aliasesPath = join(configDir, "sui.aliases");

  try {
    const keystoreContent = readFileSync(keystorePath, "utf-8");
    const aliasesContent = readFileSync(aliasesPath, "utf-8");

    const keystore: string[] = JSON.parse(keystoreContent);
    const aliases: KeyAlias[] = JSON.parse(aliasesContent);

    const keybook: Record<string, KeyInfo> = {};

    // Process each alias
    for (const keyAlias of aliases) {
      try {
        // Remove the first byte from the alias public key (key type indicator)
        const pubKeyBytes = Buffer.from(keyAlias.public_key_base64, "base64");
        const pubKey = Buffer.from(pubKeyBytes.slice(1)).toString("base64");

        // Find matching key in keystore
        const keyIndex = keystore.findIndex((key: string) => {
          try {
            const secretKeyBytes = Buffer.from(key, "base64");
            const ed25519SecretKey = secretKeyBytes.slice(1); // Remove key type prefix
            const keypair = Ed25519Keypair.fromSecretKey(ed25519SecretKey);
            return keypair.getPublicKey().toBase64() === pubKey;
          } catch {
            return false;
          }
        });

        if (keyIndex === -1) {
          continue;
        }

        // Create the keypair
        const secretKeyBytes = Buffer.from(keystore[keyIndex], "base64");
        const ed25519SecretKey = secretKeyBytes.slice(1);
        const keypair = Ed25519Keypair.fromSecretKey(ed25519SecretKey);
        const address = keypair.getPublicKey().toSuiAddress();

        keybook[keyAlias.alias] = {
          alias: keyAlias.alias,
          address,
          publicKey: keyAlias.public_key_base64,
          privateKey: keystore[keyIndex],
          keypair,
        };
      } catch (_error) {}
    }

    return keybook;
  } catch (error) {
    throw new Error(`Failed to load keybook: ${error}`);
  }
}

/**
 * Get a specific keypair by alias
 */
export function getKeypair(alias: string): KeyInfo {
  const keybook = loadKeybook();
  const keyInfo = keybook[alias];

  if (!keyInfo) {
    throw new Error(
      `Keypair for alias "${alias}" not found. Available: ${Object.keys(keybook).join(", ")}`,
    );
  }

  return keyInfo;
}

/**
 * Get alice's keypair (convenience function)
 */
export function getAlice(): KeyInfo {
  return getKeypair("alice");
}

/**
 * Get bob's keypair (convenience function)
 */
export function getBob(): KeyInfo {
  return getKeypair("bob");
}

/**
 * Get carol's keypair (convenience function)
 */
export function getCarol(): KeyInfo {
  return getKeypair("carol"); // Using carol address
}

/**
 * Get eve's keypair (convenience function)
 */
export function getEve(): KeyInfo {
  return getKeypair("eve");
}

/**
 * List all available keypairs
 */
export function listKeypairs(): string[] {
  const keybook = loadKeybook();
  return Object.keys(keybook);
}
