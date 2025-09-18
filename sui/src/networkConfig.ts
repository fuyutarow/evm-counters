import { createNetworkConfig } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";

// suigen-config.jsonから設定を読み込み
const config = {
  testnet: {
    packages: {
      counter: "0xcbd7ef54f57ea1a999c0843a3c41afa7794b1a9687dd6f6f028d7ee9bd4d8afe",
      sui: "0x2",
    },
  },
  devnet: {
    packages: {
      counter: "0x18903370f68278e20c29cede4a89785accc7b5299e3350b6790f1db76e4b4667",
      sui: "0x2",
    },
  },
  mainnet: {
    packages: {
      counter: "", // mainnetは未設定
      sui: "0x2",
    },
  },
} as const;

// ネットワーク設定
const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      counterPackageId: config.testnet.packages.counter,
      suiPackageId: config.testnet.packages.sui,
    },
  },
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: {
      counterPackageId: config.devnet.packages.counter,
      suiPackageId: config.devnet.packages.sui,
    },
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    variables: {
      counterPackageId: config.mainnet.packages.counter,
      suiPackageId: config.mainnet.packages.sui,
    },
  },
});

export { networkConfig, useNetworkVariable, useNetworkVariables };
export type NetworkVariables = {
  counterPackageId: string;
  suiPackageId: string;
};
