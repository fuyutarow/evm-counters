# EVM Counters Project Overview

## Purpose
Multi-chain counter implementation demonstrating equivalent functionality across different blockchain ecosystems:
- **EVM** (Ethereum Virtual Machine) 
- **Solana** (using Anchor framework)
- **Sui** (using Move language)

Each implementation provides "owned counter" functionality where users can create, increment, and set values on personal counters.

## Project Structure
```
evm-counters/
├── evm/           # Ethereum/Solidity implementation
├── solana/        # Solana/Anchor implementation  
├── sui/           # Sui/Move implementation
└── .claude/       # Claude Code configuration
```

## Core Functionality
All implementations provide:
1. **Create/Mint**: Generate a new owned counter
2. **Increment**: Add 1 to counter value (owner only)
3. **Set Value**: Set arbitrary value (owner only)
4. **Ownership**: Only owner can modify their counter

## Tech Stack by Chain

### EVM
- **Language**: Solidity ^0.8.26
- **Framework**: Forge (Foundry)
- **Pattern**: Single registry contract with mapping storage

### Solana  
- **Language**: Rust
- **Framework**: Anchor v0.31.1
- **Pattern**: Program + PDA accounts for data storage
- **Build**: cargo build-sbf

### Sui
- **Language**: Move
- **Framework**: Native Sui objects
- **Pattern**: Owned objects with capabilities