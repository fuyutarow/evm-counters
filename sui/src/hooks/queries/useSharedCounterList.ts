import { useSuiClientContext } from "@mysten/dapp-kit";
import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { useQuery } from "@tanstack/react-query";
import {
  parseShared_counterSharedCounter,
  type Shared_counterSharedCounterType,
} from "@/abi/counter.abi";
import { getSharedCountersQuery } from "@/graphql/counter-queries";
import { useNetworkVariable } from "@/networkConfig";
import { getGraphQLUrl, type Network } from "@/types/network";

export type SharedCounterData = Omit<Shared_counterSharedCounterType, "id"> & {
  id: string;
  version: string;
};

function parseSharedCounterData(
  contents: { json?: unknown; type?: { repr?: string } | undefined },
  nodeAddress: string,
  nodeVersion: string | number,
): SharedCounterData | null {
  if (!contents || contents.json === undefined || contents.json === null) return null;

  // Use ABI-generated parse function for type safety
  const counterData = parseShared_counterSharedCounter(contents.json);
  if (!counterData) {
    return null;
  }

  return {
    ...counterData,
    id: nodeAddress,
    version: String(nodeVersion),
  } satisfies SharedCounterData;
}

export function useSharedCounterList() {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { network } = useSuiClientContext();

  const gqlClient = new SuiGraphQLClient({
    url: getGraphQLUrl(network as Network),
  });

  const counterType = `${counterPackageId}::shared_counter::SharedCounter`;

  return useQuery({
    queryKey: ["shared-counters", counterType],
    queryFn: async (): Promise<SharedCounterData[]> => {
      const result = await gqlClient.query({
        query: getSharedCountersQuery,
        variables: {
          type: counterType,
        },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      const counters: SharedCounterData[] = [];

      const data = result.data as { objects?: { nodes?: unknown[] } };
      if (data?.objects?.nodes) {
        for (const nodeItem of data.objects.nodes) {
          const node = nodeItem as {
            asMoveObject?: {
              contents?: {
                json?: unknown;
                type?: { repr?: string };
              };
            };
            address?: string;
            version?: string | number;
          };

          if (
            node?.asMoveObject?.contents &&
            node.address &&
            node.version &&
            typeof node.asMoveObject.contents === "object" &&
            node.asMoveObject.contents !== null
          ) {
            const contents = node.asMoveObject.contents;
            if (!contents.json) continue;

            const counterData = parseSharedCounterData(
              contents,
              node.address,
              String(node.version ?? undefined),
            );
            if (counterData) {
              counters.push(counterData);
            }
          }
        }
      }

      return counters;
    },
    enabled: !!counterPackageId,
  });
}
