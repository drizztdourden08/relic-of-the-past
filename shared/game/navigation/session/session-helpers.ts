/* @layer shared-game @kind logic */

/** Flatten a 64×64 row-major Uint8Array into a number[][] grid. */
const uint8ToGrid = (raw: Uint8Array): number[][] => {
  const grid: number[][] = new Array(64);
  for (let r = 0; r < 64; r++) {
    grid[r] = new Array(64);
    for (let c = 0; c < 64; c++) {
      grid[r][c] = raw[r * 64 + c];
    }
  }
  return grid;
};

/** All screen indices in the same big-screen group as `screenIndex` (by area head). */
const computeBigScreenGroupFromHeads = (heads: number[] | null, screenIndex: number): number[] => {
  if (!heads) return [screenIndex];
  const myHead = heads[screenIndex];
  if (myHead === undefined) return [screenIndex];
  const group: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (heads[i] === myHead) group.push(i);
  }
  return group.length > 0 ? group : [screenIndex];
};

export { uint8ToGrid, computeBigScreenGroupFromHeads };
