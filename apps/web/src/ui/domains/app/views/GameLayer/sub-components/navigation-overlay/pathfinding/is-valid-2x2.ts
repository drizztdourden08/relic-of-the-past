/* @layer renderer-components @kind logic */
import { GRID_SIZE } from '@shared/game/navigation/types';
import type { ReachState } from '@shared/game/navigation/types';
import { REACH_OPEN } from './pathfinding.constants';

const isValid2x2 = (row: number, col: number, reachable: ReachState[][]): boolean => {
  if (row < 0 || row + 1 >= GRID_SIZE || col < 0 || col + 1 >= GRID_SIZE) return false;
  return reachable[row][col] === REACH_OPEN && reachable[row][col + 1] === REACH_OPEN &&
         reachable[row + 1][col] === REACH_OPEN && reachable[row + 1][col + 1] === REACH_OPEN;
};

export { isValid2x2 };
