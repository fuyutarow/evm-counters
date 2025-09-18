import { type NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";

// Anvil's default test account private key
const ANVIL_TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const ANVIL_RPC_URL = "http://localhost:8545";

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    // Create viem clients
    const publicClient = createPublicClient({
      chain: anvil,
      transport: http(ANVIL_RPC_URL),
    });

    const account = privateKeyToAccount(ANVIL_TEST_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: anvil,
      transport: http(ANVIL_RPC_URL),
    });

    // Check if Anvil is running
    try {
      await publicClient.getChainId();
    } catch (_error) {
      return NextResponse.json(
        { error: "Anvil is not running. Please start Anvil first." },
        { status: 503 },
      );
    }

    // Send 10 ETH to the requested address
    const txHash = await walletClient.sendTransaction({
      to: address as `0x${string}`,
      value: parseEther("10"),
    });

    // Wait for transaction confirmation
    await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return NextResponse.json({
      success: true,
      txHash,
      amount: "10 ETH",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to send test ETH",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
