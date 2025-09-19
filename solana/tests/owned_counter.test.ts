import { beforeAll, describe, expect, test } from "bun:test";
import * as anchor from "@coral-xyz/anchor";
import { type Program } from "@coral-xyz/anchor";
import { type OwnedCounter } from "../target/types/owned_counter";

describe("owned_counter", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.OwnedCounter as Program<OwnedCounter>;
  const authority = anchor.web3.Keypair.generate();
  const otherUser = anchor.web3.Keypair.generate();

  // Derive PDA for UserMeta
  const [userMetaPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user_meta"), authority.publicKey.toBuffer()],
    program.programId,
  );

  // Derive PDA for the first counter (index 0)
  const index = 0;
  const indexBuffer = Buffer.alloc(8);
  indexBuffer.writeBigUInt64LE(BigInt(index), 0);
  const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), authority.publicKey.toBuffer(), indexBuffer],
    program.programId,
  );

  beforeAll(async () => {
    // Airdrop SOL to test accounts and wait for confirmation
    const connection = anchor.getProvider().connection;

    await connection.confirmTransaction(
      await connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
    await connection.confirmTransaction(
      await connection.requestAirdrop(otherUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
    );
  });

  test("Initializes user and creates a new owned counter", async () => {
    // First initialize the user
    await program.methods
      .initializeUser()
      .accounts({
        owner: authority.publicKey,
        userMeta: userMetaPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    // Then create the counter
    await program.methods
      .create()
      .accounts({
        owner: authority.publicKey,
        userMeta: userMetaPda,
        counter: counterPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const counterAccount = await program.account.ownedCounter.fetch(counterPda);
    expect(counterAccount.owner.toString()).toBe(authority.publicKey.toString());
    expect(counterAccount.value.toString()).toBe("0");
    expect(counterAccount.index.toString()).toBe("0");
  });

  test("Increments counter by authority", async () => {
    await program.methods
      .increment(new anchor.BN(index))
      .accounts({
        counter: counterPda,
        owner: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    const counterAccount = await program.account.ownedCounter.fetch(counterPda);
    expect(counterAccount.value.toString()).toBe("1");
  });

  test("Sets counter value by authority", async () => {
    const newValue = new anchor.BN(42);
    await program.methods
      .setValue(new anchor.BN(index), newValue)
      .accounts({
        counter: counterPda,
        owner: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    const counterAccount = await program.account.ownedCounter.fetch(counterPda);
    expect(counterAccount.value.toString()).toBe("42");
  });

  test("Fails when non-authority tries to increment", async () => {
    try {
      await program.methods
        .increment(new anchor.BN(index))
        .accounts({
          counter: counterPda,
          owner: otherUser.publicKey,
        })
        .signers([otherUser])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail");
    } catch (error) {
      expect(error.message).toContain("not owner");
    }
  });

  test("Fails when non-authority tries to set value", async () => {
    try {
      await program.methods
        .setValue(new anchor.BN(index), new anchor.BN(999))
        .accounts({
          counter: counterPda,
          owner: otherUser.publicKey,
        })
        .signers([otherUser])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail");
    } catch (error) {
      expect(error.message).toContain("not owner");
    }
  });

  test("Fails on overflow", async () => {
    // First set to max value - 1
    const maxValue = new anchor.BN("18446744073709551614"); // u64::MAX - 1
    await program.methods
      .setValue(new anchor.BN(index), maxValue)
      .accounts({
        counter: counterPda,
        owner: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    try {
      // Try to increment which should cause overflow
      await program.methods
        .increment(new anchor.BN(index))
        .accounts({
          counter: counterPda,
          owner: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail on overflow");
    } catch (error) {
      expect(error.message).toContain("overflow");
    }
  });

  test("Cannot create counter with same PDA twice", async () => {
    try {
      await program.methods
        .create()
        .accounts({
          owner: authority.publicKey,
          userMeta: userMetaPda,
          counter: counterPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      // Should not reach this point
      expect.unreachable("Expected transaction to fail");
    } catch (error) {
      expect(error.message).toContain("already in use");
    }
  });
});
