import { useCurrentAccount, useSuiClientContext } from "@mysten/dapp-kit";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { useQuery } from "@tanstack/react-query";
import {
  type Owned_counterOwnedCounterType,
  parseOwned_counterOwnedCounter,
} from "@/abi/counter.abi";
import { getOwnedCountersQuery } from "@/graphql/counter-queries";
import { useNetworkVariable } from "@/networkConfig";
import { getGraphQLUrl, type Network } from "@/types/network";

// Type guards
interface NodeContents {
  json?: unknown;
  type?: { repr?: string };
}

interface ValidNode {
  contents: NodeContents;
  address: string;
  version: string | number;
}

function isValidNode(node: unknown): node is ValidNode {
  if (typeof node !== "object" || node === null) return false;
  if (!("address" in node) || !("version" in node) || !("contents" in node)) return false;

  const typedNode = node as { address: unknown; contents: unknown; version: unknown };
  return (
    typeof typedNode.address === "string" &&
    typeof typedNode.contents === "object" &&
    typedNode.contents !== null
  );
}

function hasValidJson(contents: NodeContents): contents is NodeContents & { json: unknown } {
  return contents.json !== undefined && contents.json !== null;
}

export type OwnedCounterData = Omit<Owned_counterOwnedCounterType, "id"> & {
  id: string;
  version: string;
};

function parseOwnedCounterData(
  contents: NodeContents,
  nodeAddress: string,
  nodeVersion: string | number,
): OwnedCounterData | null {
  if (!hasValidJson(contents)) return null;

  // Use ABI-generated parse function for type safety
  const counterData = parseOwned_counterOwnedCounter(contents.json);
  if (!counterData) {
    return null;
  }

  return {
    ...counterData,
    id: nodeAddress,
    version: String(nodeVersion),
  } satisfies OwnedCounterData;
}

export function useOwnedCounterList() {
  const account = useCurrentAccount();
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { network } = useSuiClientContext();

  const gqlClient = new SuiGraphQLClient({
    url: getGraphQLUrl(network as Network),
  });

  const counterType = `${counterPackageId}::owned_counter::OwnedCounter`;

  return useQuery({
    queryKey: ["owned-counters", account?.address, counterType],
    queryFn: async (): Promise<OwnedCounterData[]> => {
      if (!account?.address) return [];

      const result = await gqlClient.query({
        query: getOwnedCountersQuery,
        variables: {
          owner: account.address,
          type: counterType,
        },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message ?? "Unknown error"}`);
      }

      const counters: OwnedCounterData[] = [];

      const nodes =
        (result.data as { address?: { objects?: { nodes?: unknown[] } } })?.address?.objects
          ?.nodes ?? [];
      for (const node of nodes) {
        if (isValidNode(node)) {
          const counterData = parseOwnedCounterData(
            node.contents,
            node.address,
            node.version ?? "0",
          );
          if (counterData) {
            counters.push(counterData);
          }
        }
      }

      return counters;
    },
    enabled: !!account?.address && !!counterPackageId,
  });
}
