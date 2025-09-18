# EVM Counters

This dApp is a multi-chain EVM application using the following tools:

- [React](https://react.dev/) as the UI framework
- [TypeScript](https://www.typescriptlang.org/) for type checking
- [Next.js](https://nextjs.org/) for the React framework
- [Foundry](https://getfoundry.sh/) for Solidity development
- [Wagmi](https://wagmi.sh/) for EVM wallet connections
- [Viem](https://viem.sh/) for Ethereum interactions
- [Radix UI](https://www.radix-ui.com/) for pre-built UI components
- [Biome](https://biomejs.dev/) for linting and formatting
- [Bun](https://bun.sh/) for package management

## Smart Contract Development

### Install Foundry

Before deploying your smart contracts, ensure that you have installed Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Contract Development

The Solidity contracts are located in the `contracts/` directory. Key files:
- `contracts/src/` - Smart contract source files
- `contracts/test/` - Contract tests
- `contracts/script/` - Deployment scripts

### Running Tests

Run contract tests with Foundry:

```bash
cd contracts
forge test
```

### Deploying Contracts

Deploy to testnet (e.g., Sepolia):

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

Make sure to update the deployed contract addresses in `src/constants.ts`.

## Frontend Development

### Installing Dependencies

Install the frontend dependencies:

```bash
bun install
```

### Starting the Development Server

To start your dApp in development mode:

```bash
bun dev
```

### Building for Production

To build your app for deployment:

```bash
bun build
```

### Code Quality

Format and lint your code:

```bash
bun format
bun lint
```

## Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env.local
```

Set your environment variables for RPC URLs, private keys, and API keys.