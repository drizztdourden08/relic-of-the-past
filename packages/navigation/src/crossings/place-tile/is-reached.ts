/* @layer bridge-wasm @kind logic */
import type { ReachState } from '@rotp/game-core';

const isReached = (reachable: readonly ReachState[][] | undefined, row: number, col: number): boolean =>
  (reachable?.[row]?.[col] ?? 0) > 0;

export { isReached };
