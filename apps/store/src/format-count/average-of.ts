/* @layer store-site @kind logic */
const averageOf = (sum: number, count: number): number | null => (count > 0 ? sum / count : null);

export { averageOf };
