/* @layer shared-game @kind logic */
import type { GridPos } from '@rotp/game-core';
import { DIRECTIONS } from './grid.constants';
import { inBounds } from './in-bounds';

const getNeighbors = (row: number, col: number): GridPos[] => {
  const neighbors: GridPos[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (inBounds(nr, nc)) neighbors.push({ row: nr, col: nc });
  }
  return neighbors;
};

export { getNeighbors };
