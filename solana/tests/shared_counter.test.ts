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

  // Derive PDA for the first counter (ID 1)
  const id = 1;
  const idBuffer = Buffer.alloc(8);
  idBuffer.writeBigUInt64LE(BigInt(id), 0);
  const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("shared"), idBuffer],
    program.programId,
  );

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
    // First initialize the registry
    await program.methods
      .initializeRegistry()
      .accounts({
        payer: payer.publicKey,
        registry: registryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    // Then create the counter
    await program.methods
      .create()
      .accounts({
        creator: creator.publicKey,
        payer: payer.publicKey,
        registry: registryPda,
        counter: counterPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator, payer])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    expect(counterAccount.value.toString()).toBe("0");
    expect(counterAccount.id.toString()).toBe("1");
  });

  test("Allows creator to increment counter", async () => {
    await program.methods
      .increment(new anchor.BN(id))
      .accounts({
        counter: counterPda,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    expect(counterAccount.value.toString()).toBe("1");
  });

  test("Allows other user to increment counter", async () => {
    await program.methods
      .increment(new anchor.BN(id))
      .accounts({
        counter: counterPda,
        caller: otherUser.publicKey,
      })
      .signers([otherUser])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    expect(counterAccount.value.toString()).toBe("2");
  });

  test("Allows creator to set counter value", async () => {
    const newValue = new anchor.BN(100);
    await program.methods
      .setValue(new anchor.BN(id), newValue)
      .accounts({
        counter: counterPda,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    expect(counterAccount.value.toString()).toBe("100");
  });

  test("Allows other user to set counter value", async () => {
    const newValue = new anchor.BN(200);
    await program.methods
      .setValue(new anchor.BN(id), newValue)
      .accounts({
        counter: counterPda,
        caller: otherUser.publicKey,
      })
      .signers([otherUser])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    expect(counterAccount.value.toString()).toBe("200");
  });

  test("Fails on overflow during increment", async () => {
    // First set to max value - 1
    const maxValue = new anchor.BN("18446744073709551614"); // u64::MAX - 1
    await program.methods
      .setValue(new anchor.BN(id), maxValue)
      .accounts({
        counter: counterPda,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    try {
      // Try to increment which should cause overflow
      await program.methods
        .increment(new anchor.BN(id))
        .accounts({
          counter: counterPda,
          caller: creator.publicKey,
        })
        .signers([creator])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail on overflow");
    } catch (error) {
      expect(error.message).toContain("overflow");
    }
  });

  test("Cannot create counter with same ID twice", async () => {
    try {
      await program.methods
        .create()
        .accounts({
          creator: creator.publicKey,
          payer: payer.publicKey,
          registry: registryPda,
          counter: counterPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator, payer])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail");
    } catch (error) {
      expect(error.message).toContain("already in use");
    }
  });

  test("Allows multiple counters with different IDs", async () => {
    const newId = 2;
    const newIdBuffer = Buffer.alloc(8);
    newIdBuffer.writeBigUInt64LE(BigInt(newId), 0);
    const [newCounterPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("shared"), newIdBuffer],
      program.programId,
    );

    // Create second counter
    await program.methods
      .create()
      .accounts({
        creator: creator.publicKey,
        payer: payer.publicKey,
        registry: registryPda,
        counter: newCounterPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator, payer])
      .rpc();

    const newCounterAccount = await program.account.sharedCounter.fetch(newCounterPda);
    expect(newCounterAccount.value.toString()).toBe("0");
    expect(newCounterAccount.id.toString()).toBe("2");

    // Verify first counter still exists and has its value
    const originalCounterAccount = await program.account.sharedCounter.fetch(counterPda);
    expect(originalCounterAccount.id.toString()).toBe("1");
  });
});
