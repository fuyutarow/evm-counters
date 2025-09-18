export type Network = "devnet" | "testnet" | "mainnet";

export const GRAPHQL_ENDPOINTS = {
  devnet: "https://sui-devnet.mystenlabs.com/graphql",
  testnet: "https://sui-testnet.mystenlabs.com/graphql",
  mainnet: "https://sui-mainnet.mystenlabs.com/graphql",
} as const satisfies Record<Network, string>;

export const getGraphQLUrl = (network: Network): string => GRAPHQL_ENDPOINTS[network];
