import assert from "node:assert";
import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import type { SharedCounter } from "../target/types/shared_counter";

describe("shared_counter", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SharedCounter as Program<SharedCounter>;
  const creator = anchor.web3.Keypair.generate();
  const otherUser = anchor.web3.Keypair.generate();
  const seed = new anchor.BN(54321);

  // Derive PDA for the counter
  const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("shared"),
      creator.publicKey.toBuffer(),
      seed.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  before(async () => {
    // Airdrop SOL to test accounts
    await anchor.getProvider().connection.requestAirdrop(
      creator.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await anchor.getProvider().connection.requestAirdrop(
      otherUser.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
  });

  it("Creates a new shared counter", async () => {
    await program.methods
      .create(seed)
      .accounts({
        counter: counterPda,
        creator: creator.publicKey,
        payer: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    assert.strictEqual(counterAccount.value.toString(), "0");
    assert.strictEqual(counterAccount.seed.toString(), seed.toString());
  });

  it("Allows creator to increment counter", async () => {
    await program.methods
      .increment()
      .accounts({
        counter: counterPda,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    assert.strictEqual(counterAccount.value.toString(),("1");
  });

  it("Allows other user to increment counter", async () => {
    await program.methods
      .increment()
      .accounts({
        counter: counterPda,
        caller: otherUser.publicKey,
      })
      .signers([otherUser])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    assert.strictEqual(counterAccount.value.toString(),("2");
  });

  it("Allows creator to set counter value", async () => {
    const newValue = new anchor.BN(100);
    await program.methods
      .setValue(newValue)
      .accounts({
        counter: counterPda,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    assert.strictEqual(counterAccount.value.toString(),("100");
  });

  it("Allows other user to set counter value", async () => {
    const newValue = new anchor.BN(200);
    await program.methods
      .setValue(newValue)
      .accounts({
        counter: counterPda,
        caller: otherUser.publicKey,
      })
      .signers([otherUser])
      .rpc();

    const counterAccount = await program.account.sharedCounter.fetch(counterPda);
    assert.strictEqual(counterAccount.value.toString(),("200");
  });

  it("Fails on overflow during increment", async () => {
    // First set to max value - 1
    const maxValue = new anchor.BN("18446744073709551614"); // u64::MAX - 1
    await program.methods
      .setValue(maxValue)
      .accounts({
        counter: counterPda,
        caller: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    try {
      // Try to increment which should cause overflow
      await program.methods
        .increment()
        .accounts({
          counter: counterPda,
          caller: creator.publicKey,
        })
        .signers([creator])
        .rpc();

      // Should not reach this point
      assert.fail("Expected transaction to fail on overflow");
    } catch (error) {
      assert(error.message.includes("overflow"));
    }
  });

  it("Cannot create counter with same PDA twice", async () => {
    try {
      await program.methods
        .create(seed)
        .accounts({
          counter: counterPda,
          creator: creator.publicKey,
          payer: creator.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      // Should not reach this point
      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert(error.message.includes("already in use"));
    }
  });

  it("Allows multiple counters with different seeds", async () => {
    const newSeed = new anchor.BN(99999);
    const [newCounterPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("shared"),
        creator.publicKey.toBuffer(),
        newSeed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // Create second counter
    await program.methods
      .create(newSeed)
      .accounts({
        counter: newCounterPda,
        creator: creator.publicKey,
        payer: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    const newCounterAccount = await program.account.sharedCounter.fetch(newCounterPda);
    assert.strictEqual(newCounterAccount.value.toString(), "0");
    assert.strictEqual(newCounterAccount.seed.toString(), newSeed.toString());

    // Verify first counter still exists and has its value
    const originalCounterAccount = await program.account.sharedCounter.fetch(counterPda);
    assert.strictEqual(originalCounterAccount.seed.toString(), seed.toString());
  });
});