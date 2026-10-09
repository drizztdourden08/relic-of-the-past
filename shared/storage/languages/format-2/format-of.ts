/* @layer shared-storage @kind logic */
const formatOf = (header: Record<string, unknown>): number => (
  typeof header.format === 'number' ? header.format : 1
);

export { formatOf };
