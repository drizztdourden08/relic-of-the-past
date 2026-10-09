/* @layer shared-game @kind logic */
import type { TilePassability, LedgeTraversal } from '@rotp/game-core';
import { GRID_SIZE } from '../../types/grid.constants';
import { bodyFits } from './body-fits';
import { findDiagonalLanding } from './find-diagonal-landing';
import { isLandable } from './is-landable';
import { isStandable } from './is-standable';
import { DIAGONAL_NAME, DIAGONAL_VERTICAL } from './cliff-preprocessing.constants';

const bestDiagonalHop = (grid: TilePassability[][], rawAttr: number[][], row: number, col: number, dv: -1 | 1): { dh: -1 | 1; row: number; col: number } | null => {
  const standable = (r: number, c: number): boolean => isStandable(grid, rawAttr, r, c);
  const landable = (r: number, c: number): boolean => isLandable(grid, r, c);

  let best: { dh: -1 | 1; row: number; col: number; steps: number; solid: boolean } | null = null;
  for (const dh of [-1, 1] as const) {
    const loose = bodyFits(row, col - dh, standable) || bodyFits(row - dv, col - dh, standable);
    if (!loose) continue;
    const land = findDiagonalLanding(grid, row, col, dv, dh);
    if (!land) continue;
    const solid = bodyFits(row, col - dh, landable) || bodyFits(row - dv, col - dh, landable);
    const steps = Math.abs(land.col - col);
    const better = !best || (solid !== best.solid ? solid : steps < best.steps);
    if (better) best = { dh, row: land.row, col: land.col, steps, solid };
  }
  return best;
};

const processDiagonalCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[]): void => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const dv = DIAGONAL_VERTICAL[rawAttr[row][col]];
      if (dv === undefined) continue;
      const best = bestDiagonalHop(grid, rawAttr, row, col, dv);
      if (!best) continue;
      if (grid[row][col].type !== 'ledge') grid[row][col] = { type: 'ledge', dir: DIAGONAL_NAME[`${dv},${best.dh}`] };
      ledges.push({ startRow: row, startCol: col, endRow: best.row, endCol: best.col });
    }
  }
};

export { processDiagonalCliffs };
