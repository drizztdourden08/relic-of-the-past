/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import { GRID_SIZE } from '../types/grid.constants';

const has2TileClearance = (pos: GridPos, step: readonly [number, number], isPassable: (r: number, c: number) => boolean): boolean => {
  const { row, col } = pos;
  const [dr] = step;
  if (dr !== 0) {
    return (col > 0 && isPassable(row, col - 1)) || (col < GRID_SIZE - 1 && isPassable(row, col + 1));
  }
  return (row > 0 && isPassable(row - 1, col)) || (row < GRID_SIZE - 1 && isPassable(row + 1, col));
};

export { has2TileClearance };
