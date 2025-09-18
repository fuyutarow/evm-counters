# Sui Counters - Move Smart Contract Demo

A demonstration of counter smart contracts on Sui blockchain using Move language.

## Features

### Owned Counter
- Personal counter that only the owner can modify
- Owner can increment the counter
- Owner can set custom values

### Shared Counter
- Shared counter that anyone can increment
- Owner can set custom values
- Collaborative counting

## Project Structure

```
sui/
├── move/counter/           # Move smart contracts
│   ├── sources/
│   │   ├── owned_counter.move    # Owned counter implementation
│   │   └── shared_counter.move   # Shared counter implementation
│   └── Move.toml
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── hooks/            # React hooks
└── README.md
```

## Getting Started

### Prerequisites
- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install)
- [Bun](https://bun.sh/) or Node.js
- A Sui wallet (recommended: Sui Wallet browser extension)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd evm-counters/sui
```

2. Install dependencies
```bash
mise run install
# or
bun install
```

### Development

1. Start the development server
```bash
mise run dev
# or
bun run dev
```

2. Build Move contracts
```bash
mise run sui-build
# or
cd move/counter && sui move build
```

3. Deploy to testnet
```bash
mise run sui-deploy
# or
cd move/counter && sui client publish --gas-budget 100000000
```

## Move Contracts

### OwnedCounter
```move
public struct OwnedCounter has key, store {
    id: UID,
    value: u64,
}
```

### SharedCounter
```move
public struct SharedCounter has key {
    id: UID,
    owner: address,
    value: u64,
}
```

## Available Commands

- `mise run dev` - Start development server
- `mise run build` - Build the project
- `mise run sui-build` - Build Move contracts
- `mise run sui-test` - Run Move tests
- `mise run sui-deploy` - Deploy contracts
- `mise run lint` - Run linters
- `mise run fix` - Fix code issues

## License

MIT License