/* @layer shared-game @kind logic */
import { GRID_SIZE } from '../types/grid.constants';

const has2TileClearance = (row: number, col: number, dr: number, dc: number, isPassable: (r: number, c: number) => boolean): boolean => {
  if (dr !== 0) {
    if (col > 0 && isPassable(row, col - 1)) return true;
    if (col < GRID_SIZE - 1 && isPassable(row, col + 1)) return true;
  } else {
    if (row > 0 && isPassable(row - 1, col)) return true;
    if (row < GRID_SIZE - 1 && isPassable(row + 1, col)) return true;
  }
  return false;
};

export { has2TileClearance };
