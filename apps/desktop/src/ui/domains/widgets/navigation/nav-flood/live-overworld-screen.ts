/* @layer renderer-widgets @kind logic */
const liveOverworldScreenOf = (linkX: number, linkY: number): number =>
  (((linkY >> 9) & 7) << 3) | ((linkX >> 9) & 7);

export { liveOverworldScreenOf };
