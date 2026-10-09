/* @layer shared-hub @kind logic */
const batchesOf = (list: readonly number[], size: number): number[][] =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));

export { batchesOf };
