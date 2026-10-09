/* @layer renderer-components @kind logic */
import type { ReachState } from '@rotp/game-core';
import { isTraversalDirCompatible } from './is-traversal-dir-compatible';
import { LEDGE_STATE_MAX, LEDGE_STATE_MIN, REACH_BLOCKED } from './pathfinding.constants';

const canLeave2x2 = (row: number, col: number, dr: number, dc: number, reachable: ReachState[][]): boolean => {
  const positions: [number, number][] = [[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]];
  for (const [r, c] of positions) {
    const state = reachable[r]?.[c] ?? REACH_BLOCKED;
    const onLedge = state >= LEDGE_STATE_MIN && state <= LEDGE_STATE_MAX;
    if (onLedge && !isTraversalDirCompatible(state, dr, dc)) return false;
  }
  return true;
};

export { canLeave2x2 };
