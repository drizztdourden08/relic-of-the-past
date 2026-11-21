/* @layer shared-game @kind logic */
const centreOf = (from: number, to: number): number => from + Math.floor((to - from) / 2);

export { centreOf };
