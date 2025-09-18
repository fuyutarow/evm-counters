// OwnedCounter取得用のGraphQLクエリ
export const getOwnedCountersQuery = `
  query GetOwnedCounters($owner: SuiAddress!, $type: String!) {
    address(address: $owner) {
      objects(first: 50, filter: { type: $type }) {
        nodes {
          address
          version
          contents {
            json
            type {
              repr
            }
          }
        }
      }
    }
  }
`;

// SharedCounter取得用のGraphQLクエリ
export const getSharedCountersQuery = `
  query GetSharedCounters($type: String!) {
    objects(first: 50, filter: { type: $type }) {
      nodes {
        address
        version
        asMoveObject {
          contents {
            json
            type {
              repr
            }
          }
        }
      }
    }
  }
`;
