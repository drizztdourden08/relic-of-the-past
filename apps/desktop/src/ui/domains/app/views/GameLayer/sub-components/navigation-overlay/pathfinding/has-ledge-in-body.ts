/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@rotp/navigation';
import type { ReachState } from '@rotp/game-core';
import { isTraversalDirCompatible } from './is-traversal-dir-compatible';
import { LEDGE_STATE_MAX, LEDGE_STATE_MIN } from './pathfinding.constants';

const hasLedgeInBody = (nr: number, nc: number, grid: ReachState[][], dr: number, dc: number): boolean => {
  if (nr < 0 || nr + 1 >= GRID_SIZE || nc < 0 || nc + 1 >= GRID_SIZE) return false;
  const positions: [number, number][] = [[nr, nc], [nr, nc + 1], [nr + 1, nc], [nr + 1, nc + 1]];
  for (const [r, c] of positions) {
    const state = grid[r][c];
    if (state >= LEDGE_STATE_MIN && state <= LEDGE_STATE_MAX && isTraversalDirCompatible(state, dr, dc)) return true;
  }
  return false;
};

export { hasLedgeInBody };
