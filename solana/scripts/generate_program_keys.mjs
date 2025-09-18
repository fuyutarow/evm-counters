// Utility to regenerate local Anchor program keypairs for testing.
import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function generate(name) {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const pub = Buffer.from(publicKey.export({ format: "jwk" }).x, "base64url");
  const priv = Buffer.from(privateKey.export({ format: "jwk" }).d, "base64url");
  const keypair = Buffer.concat([priv, pub]);
  const outDir = join("target", "deploy");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${name}-keypair.json`);
  writeFileSync(outPath, `[${Array.from(keypair).join(",")}]\n`);
}

["owned_counter", "shared_counter"].map(generate);
