/* @layer shared-game @kind logic */
import type { GridPos, TilePassability, LedgeTraversal } from '@rotp/game-core';
import type { DiagonalHop } from './diagonal-hop.type';
import { GRID_SIZE } from '../../types/grid.constants';
import { cellAt, itemAt } from '../../../checked-access';
import { bodyFits } from './body-fits';
import { findDiagonalLanding } from './find-diagonal-landing';
import { isLandable } from './is-landable';
import { isStandable } from './is-standable';
import { DIAGONAL_NAME, DIAGONAL_VERTICAL } from './cliff-preprocessing.constants';

const isBetterHop = (candidate: DiagonalHop, best: DiagonalHop | null): boolean => {
  if (!best) return true;
  if (candidate.solid !== best.solid) return candidate.solid;
  return candidate.steps < best.steps;
};

const bestDiagonalHop = (grid: TilePassability[][], rawAttr: number[][], start: GridPos, dv: -1 | 1): DiagonalHop | null => {
  const { row, col } = start;
  const standable = (r: number, c: number): boolean => isStandable(grid, rawAttr, r, c);
  const landable = (r: number, c: number): boolean => isLandable(grid, r, c);

  let best: DiagonalHop | null = null;
  for (const dh of [-1, 1] as const) {
    const loose = bodyFits(row, col - dh, standable) || bodyFits(row - dv, col - dh, standable);
    const land = loose ? findDiagonalLanding(grid, start, [dv, dh]) : null;
    if (!land) continue;
    const solid = bodyFits(row, col - dh, landable) || bodyFits(row - dv, col - dh, landable);
    const candidate: DiagonalHop = { dh, row: land.row, col: land.col, steps: Math.abs(land.col - col), solid };
    if (isBetterHop(candidate, best)) best = candidate;
  }
  return best;
};

const processDiagonalCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[]): void => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const dv = DIAGONAL_VERTICAL[cellAt(rawAttr, row, col)];
      if (dv === undefined) continue;
      const best = bestDiagonalHop(grid, rawAttr, { row, col }, dv);
      if (!best) continue;
      if (cellAt(grid, row, col).type !== 'ledge') itemAt(grid, row)[col] = { type: 'ledge', dir: DIAGONAL_NAME[dv][best.dh] };
      ledges.push({ startRow: row, startCol: col, endRow: best.row, endCol: best.col });
    }
  }
};

export { processDiagonalCliffs };
