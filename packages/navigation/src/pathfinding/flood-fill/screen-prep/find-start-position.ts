/* @layer shared-game @kind logic */
import type { CollisionGrid, GridPos } from '@rotp/game-core';
import { GRID_SIZE } from '../../types/grid.constants';
import { inBounds } from '../../core/in-bounds';
import { cellAt } from '../../../checked-access';

const nearestFreeTile = (grid: CollisionGrid, centerRow: number, centerCol: number): GridPos | null => {
  let best: GridPos | null = null;
  let bestD2 = Number.POSITIVE_INFINITY;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (cellAt(grid.tiles, r, c).type !== 'free') continue;
      const dr = r - centerRow;
      const dc = c - centerCol;
      const d2 = dr * dr + dc * dc;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = { row: r, col: c };
      }
    }
  }
  return best;
};

const findStartPosition = (grid: CollisionGrid, startPos?: GridPos): GridPos => {
  const row = Math.max(0, Math.min(GRID_SIZE - 1, startPos?.row ?? 32));
  const col = Math.max(0, Math.min(GRID_SIZE - 1, startPos?.col ?? 32));

  const local: GridPos[] = [
    { row, col },
    { row, col: col + 1 },
    { row, col: col - 1 },
    { row: row + 1, col },
    { row: row - 1, col },
    { row: row + 1, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
    { row: row - 1, col: col - 1 },
  ];
  const nearby = local.find((p) => inBounds(p.row, p.col) && cellAt(grid.tiles, p.row, p.col).type === 'free');
  if (nearby) return nearby;

  return nearestFreeTile(grid, row + 0.5, col + 0.5) ?? { row, col };
};

export { findStartPosition };
