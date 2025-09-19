import { beforeAll, describe, expect, test } from "bun:test";
import * as anchor from "@coral-xyz/anchor";
import { type Program } from "@coral-xyz/anchor";
import { type OwnedCounter } from "../target/types/owned_counter";

describe("owned_counter", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.OwnedCounter as Program<OwnedCounter>;
  const owner = anchor.web3.Keypair.generate();
  const otherUser = anchor.web3.Keypair.generate();
  const counterKeypair = anchor.web3.Keypair.generate();

  const seed = 12345;

  beforeAll(async () => {
    // Airdrop SOL to test accounts and wait for confirmation
    const connection = anchor.getProvider().connection;

    await connection.confirmTransaction(
      await connection.requestAirdrop(owner.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
    );
    await connection.confirmTransaction(
      await connection.requestAirdrop(otherUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
    );
  });

  test("Creates a new owned counter", async () => {
    await program.methods
      .create(new anchor.BN(seed))
      .accountsPartial({
        owner: owner.publicKey,
        counter: counterKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner, counterKeypair])
      .rpc();

    const counterAccount = await program.account.ownedCounter.fetch(counterKeypair.publicKey);
    expect(counterAccount.owner.toString()).toBe(owner.publicKey.toString());
    expect(counterAccount.value.toString()).toBe("0");
    expect(counterAccount.seed.toString()).toBe(seed.toString());
  });

  test("Increments counter by owner", async () => {
    await program.methods
      .increment()
      .accountsPartial({
        counter: counterKeypair.publicKey,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    const counterAccount = await program.account.ownedCounter.fetch(counterKeypair.publicKey);
    expect(counterAccount.value.toString()).toBe("1");
  });

  test("Sets counter value by owner", async () => {
    const newValue = new anchor.BN(42);
    await program.methods
      .setValue(newValue)
      .accountsPartial({
        counter: counterKeypair.publicKey,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    const counterAccount = await program.account.ownedCounter.fetch(counterKeypair.publicKey);
    expect(counterAccount.value.toString()).toBe("42");
  });

  test("Fails when non-owner tries to increment", async () => {
    try {
      await program.methods
        .increment()
        .accountsPartial({
          counter: counterKeypair.publicKey,
          owner: otherUser.publicKey,
        })
        .signers([otherUser])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail");
    } catch (error) {
      expect((error as Error).message).toContain("ConstraintHasOne");
    }
  });

  test("Fails when non-owner tries to set value", async () => {
    try {
      await program.methods
        .setValue(new anchor.BN(999))
        .accountsPartial({
          counter: counterKeypair.publicKey,
          owner: otherUser.publicKey,
        })
        .signers([otherUser])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail");
    } catch (error) {
      expect((error as Error).message).toContain("ConstraintHasOne");
    }
  });

  test("Fails on overflow", async () => {
    // First set to max value - 1
    const maxValue = new anchor.BN("18446744073709551614"); // u64::MAX - 1
    await program.methods
      .setValue(maxValue)
      .accountsPartial({
        counter: counterKeypair.publicKey,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    try {
      // Try to increment which should cause overflow
      await program.methods
        .increment()
        .accountsPartial({
          counter: counterKeypair.publicKey,
          owner: owner.publicKey,
        })
        .signers([owner])
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
        .create(new anchor.BN(seed))
        .accountsPartial({
          owner: owner.publicKey,
          counter: counterKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner, counterKeypair])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail");
    } catch (error) {
      expect((error as Error).message).toContain("already in use");
    }
  });
});
