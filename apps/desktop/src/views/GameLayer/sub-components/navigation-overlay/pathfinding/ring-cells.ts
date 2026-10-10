/* @layer renderer-components @kind logic */
import type { GridPos } from '../navigation-overlay.type';

const ringCells = (center: GridPos, radius: number): GridPos[] => {
  const cells: GridPos[] = [];
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      if (Math.abs(dr) === radius || Math.abs(dc) === radius) cells.push({ row: center.row + dr, col: center.col + dc });
    }
  }
  return cells;
};

export { ringCells };
