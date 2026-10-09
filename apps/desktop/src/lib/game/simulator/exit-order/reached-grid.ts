/* @layer bridge-wasm @kind logic */
import type { ReachState } from '@rotp/game-core';

const reachedGrid = (reachable: ReachState[][]): boolean[][] =>
  reachable.map((row) => row.map((v) => v > 0));

export { reachedGrid };
