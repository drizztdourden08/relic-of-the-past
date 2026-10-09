/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import { GRID_SIZE } from '../../pathfinding/types/grid.constants';

const footprint = (row: number, col: number): GridPos[] => {
  const cells: GridPos[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) cells.push({ row: r, col: c });
    }
  }
  return cells;
};

export { footprint };
