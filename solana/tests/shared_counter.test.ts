import { beforeAll, describe, expect, test } from "bun:test";
import * as anchor from "@coral-xyz/anchor";
import { type Program } from "@coral-xyz/anchor";
import { type SharedCounter } from "../target/types/shared_counter";

describe("shared_counter", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SharedCounter as Program<SharedCounter>;
  const creator = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();
  const otherUser = anchor.web3.Keypair.generate();

  // Derive PDA for the registry
  const [registryPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("shared_registry")],
    program.programId,
  );

  // Create keypair for the first counter
  const counterKeypair = anchor.web3.Keypair.generate();

  beforeAll(async () => {
    // Airdrop SOL to test accounts and wait for confirmation
    const connection = anchor.getProvider().connection;

    await connection.confirmTransaction(
      await connection.requestAirdrop(creator.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
    );
    await connection.confirmTransaction(
      await connection.requestAirdrop(payer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
    );
    await connection.confirmTransaction(
      await connection.requestAirdrop(otherUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
    );
  });

  test("Initializes registry and creates a new shared counter", async () => {
    // Try to initialize the registry (might already exist)
    try {
      await program.methods
        .initializeRegistry()
        .accountsPartial({
          payer: payer.publicKey,
          registry: registryPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([payer])
        .rpc();
    } catch (error) {
      // Registry might already be initialized, that's OK
      if (!(error as Error).message.includes("already in use")) {
        throw error;
      }
    }

    // Then create the counter
    await program.methods
      .create()
      .accountsPartial({
        creator: creator.publicKey,
        payer: payer.publicKey,
        registry: registryPda,
        counter: counterKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator, payer, counterKeypair])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterKeypair.publicKey);
    expect(counterAccount.value.toString()).toBe("0");
    expect(Number(counterAccount.id.toString())).toBeGreaterThan(0);
  });

  test("Allows creator to increment counter", async () => {
    await program.methods
      .increment()
      .accountsPartial({
        counter: counterKeypair.publicKey,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterKeypair.publicKey);
    expect(counterAccount.value.toString()).toBe("1");
  });

  test("Allows other user to increment counter", async () => {
    await program.methods
      .increment()
      .accountsPartial({
        counter: counterKeypair.publicKey,
        caller: otherUser.publicKey,
      })
      .signers([otherUser])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterKeypair.publicKey);
    expect(counterAccount.value.toString()).toBe("2");
  });

  test("Allows creator to set counter value", async () => {
    const newValue = new anchor.BN(100);
    await program.methods
      .setValue(newValue)
      .accountsPartial({
        counter: counterKeypair.publicKey,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterKeypair.publicKey);
    expect(counterAccount.value.toString()).toBe("100");
  });

  test("Allows other user to set counter value", async () => {
    const newValue = new anchor.BN(200);
    await program.methods
      .setValue(newValue)
      .accountsPartial({
        counter: counterKeypair.publicKey,
        caller: otherUser.publicKey,
      })
      .signers([otherUser])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterKeypair.publicKey);
    expect(counterAccount.value.toString()).toBe("200");
  });

  test("Fails on overflow during increment", async () => {
    // First set to max value - 1
    const maxValue = new anchor.BN("18446744073709551614"); // u64::MAX - 1
    await program.methods
      .setValue(maxValue)
      .accountsPartial({
        counter: counterKeypair.publicKey,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    try {
      // Try to increment which should cause overflow
      await program.methods
        .increment()
        .accountsPartial({
          counter: counterKeypair.publicKey,
          caller: creator.publicKey,
        })
        .signers([creator])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail on overflow");
    } catch (error) {
      expect((error as Error).message).toContain("overflow");
    }
  });

  test("Cannot create counter with same keypair twice", async () => {
    try {
      await program.methods
        .create()
        .accountsPartial({
          creator: creator.publicKey,
          payer: payer.publicKey,
          registry: registryPda,
          counter: counterKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator, payer, counterKeypair])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail");
    } catch (error) {
      expect((error as Error).message).toContain("already in use");
    }
  });

  test("Allows multiple counters with different keypairs", async () => {
    const newCounterKeypair = anchor.web3.Keypair.generate();

    // Create second counter
    await program.methods
      .create()
      .accountsPartial({
        creator: creator.publicKey,
        payer: payer.publicKey,
        registry: registryPda,
        counter: newCounterKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator, payer, newCounterKeypair])
      .rpc();

    const newCounterAccount = await program.account.sharedCounter.fetch(
      newCounterKeypair.publicKey,
    );
    expect(newCounterAccount.value.toString()).toBe("0");
    expect(Number(newCounterAccount.id.toString())).toBeGreaterThan(0);

    // Verify first counter still exists and has its value
    const originalCounterAccount = await program.account.sharedCounter.fetch(
      counterKeypair.publicKey,
    );
    expect(Number(originalCounterAccount.id.toString())).toBeGreaterThan(0);

    // New counter should have a different ID than the original
    expect(newCounterAccount.id.toString()).not.toBe(originalCounterAccount.id.toString());
  });
});
