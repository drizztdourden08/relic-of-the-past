/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@shared/game/navigation/types/grid.constants';
import type { ReachState } from '@rotp/game-core';
import { REACH_BLOCKED } from './pathfinding.constants';

const isReachable2x2 = (row: number, col: number, reachable: ReachState[][]): boolean => {
  if (row < 0 || row + 1 >= GRID_SIZE || col < 0 || col + 1 >= GRID_SIZE) return false;
  return reachable[row][col] !== REACH_BLOCKED && reachable[row][col + 1] !== REACH_BLOCKED &&
         reachable[row + 1][col] !== REACH_BLOCKED && reachable[row + 1][col + 1] !== REACH_BLOCKED;
};

export { isReachable2x2 };
