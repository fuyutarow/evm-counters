import assert from "node:assert";
import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import type { OwnedCounter } from "../target/types/owned_counter";

describe("owned_counter", () => {
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace.OwnedCounter as Program<OwnedCounter>;
	const authority = anchor.web3.Keypair.generate();
	const otherUser = anchor.web3.Keypair.generate();
	const seed = new anchor.BN(12345);

	// Derive PDA for the counter
	const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
		[
			Buffer.from("owned"),
			authority.publicKey.toBuffer(),
			seed.toArrayLike(Buffer, "le", 8),
		],
		program.programId,
	);

	before(async () => {
		// Airdrop SOL to test accounts
		await anchor
			.getProvider()
			.connection.requestAirdrop(
				authority.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			);
		await anchor
			.getProvider()
			.connection.requestAirdrop(
				otherUser.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			);
	});

	it("Creates a new owned counter", async () => {
		await program.methods
			.create(seed)
			.accounts({
				counter: counterPda,
				authority: authority.publicKey,
				payer: authority.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([authority])
			.rpc();

		const counterAccount = await program.account.ownedCounter.fetch(counterPda);
		assert.strictEqual(
			counterAccount.authority.toString(),
			authority.publicKey.toString(),
		);
		assert.strictEqual(counterAccount.value.toString(), "0");
		assert.strictEqual(counterAccount.seed.toString(), seed.toString());
	});

	it("Increments counter by authority", async () => {
		await program.methods
			.increment()
			.accounts({
				counter: counterPda,
				authority: authority.publicKey,
			})
			.signers([authority])
			.rpc();

		const counterAccount = await program.account.ownedCounter.fetch(counterPda);
		assert.strictEqual(counterAccount.value.toString(), "1");
	});

	it("Sets counter value by authority", async () => {
		const newValue = new anchor.BN(42);
		await program.methods
			.setValue(newValue)
			.accounts({
				counter: counterPda,
				authority: authority.publicKey,
			})
			.signers([authority])
			.rpc();

		const counterAccount = await program.account.ownedCounter.fetch(counterPda);
		assert.strictEqual(counterAccount.value.toString(), "42");
	});

	it("Fails when non-authority tries to increment", async () => {
		try {
			await program.methods
				.increment()
				.accounts({
					counter: counterPda,
					authority: otherUser.publicKey,
				})
				.signers([otherUser])
				.rpc();

			// Should not reach this point
			assert.fail("Expected transaction to fail");
		} catch (error) {
			assert(error.message.includes("not owner"));
		}
	});

	it("Fails when non-authority tries to set value", async () => {
		try {
			await program.methods
				.setValue(new anchor.BN(999))
				.accounts({
					counter: counterPda,
					authority: otherUser.publicKey,
				})
				.signers([otherUser])
				.rpc();

			// Should not reach this point
			assert.fail("Expected transaction to fail");
		} catch (error) {
			assert(error.message.includes("not owner"));
		}
	});

	it("Fails on overflow", async () => {
		// First set to max value - 1
		const maxValue = new anchor.BN("18446744073709551614"); // u64::MAX - 1
		await program.methods
			.setValue(maxValue)
			.accounts({
				counter: counterPda,
				authority: authority.publicKey,
			})
			.signers([authority])
			.rpc();

		try {
			// Try to increment which should cause overflow
			await program.methods
				.increment()
				.accounts({
					counter: counterPda,
					authority: authority.publicKey,
				})
				.signers([authority])
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
					authority: authority.publicKey,
					payer: authority.publicKey,
					systemProgram: anchor.web3.SystemProgram.programId,
				})
				.signers([authority])
				.rpc();

			// Should not reach this point
			assert.fail("Expected transaction to fail");
		} catch (error) {
			assert(error.message.includes("already in use"));
		}
	});
});
