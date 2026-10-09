/* @layer bridge-wasm @kind logic */
import type { ReachState } from '@rotp/game-core';
import { TOUCH } from './reachability.constants';

const reachableNear = (reachable: readonly ReachState[][], row: number, col: number): boolean => {
  for (let r = row - TOUCH; r <= row + TOUCH; r++) {
    const line = reachable[r];
    if (!line) continue;
    for (let c = col - TOUCH; c <= col + TOUCH; c++) {
      if ((line[c] ?? 0) > 0) return true;
    }
  }
  return false;
};

export { reachableNear };
