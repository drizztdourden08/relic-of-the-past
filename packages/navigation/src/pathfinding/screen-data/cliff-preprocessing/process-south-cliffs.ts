/* @layer shared-game @kind logic */
import type { TilePassability, LedgeTraversal } from '@rotp/game-core';
import { GRID_SIZE } from '../../types/grid.constants';
import { cellAt, itemAt } from '../../../checked-access';
import { SOUTH_CLIFF_BORDER_ATTRS } from './cliff-preprocessing.constants';

const isSouthCliffTile = (grid: TilePassability[][], r: number, c: number): boolean => {
  const t = cellAt(grid, r, c);
  return t.type === 'blocked' || (t.type === 'ledge' && t.dir === 's');
};

const isCliffBorder = (grid: TilePassability[][], rawAttr: number[][], row: number, col: number): boolean => {
  if (!SOUTH_CLIFF_BORDER_ATTRS.has(cellAt(rawAttr, row, col)) || row <= 0) return false;
  const above = cellAt(grid, row - 1, col).type;
  return above === 'free' || above === 'ledge';
};

const dropSouthCliff = (grid: TilePassability[][], ledges: LedgeTraversal[], row: number, col: number): void => {
  if (cellAt(grid, row, col).type === 'blocked') itemAt(grid, row)[col] = { type: 'free' };

  let r = row + 1;
  while (r < GRID_SIZE && isSouthCliffTile(grid, r, col)) {
    if (cellAt(grid, r, col).type === 'blocked') itemAt(grid, r)[col] = { type: 'ledge', dir: 's' };
    r++;
  }
  if (r > row + 1 && r < GRID_SIZE) ledges.push({ startRow: row, startCol: col, endRow: r, endCol: col });
};

const processSouthCliffs = (grid: TilePassability[][], rawAttr: number[][], ledges: LedgeTraversal[]): void => {
  for (let row = 0; row < GRID_SIZE - 1; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (isCliffBorder(grid, rawAttr, row, col) && isSouthCliffTile(grid, row + 1, col)) dropSouthCliff(grid, ledges, row, col);
    }
  }
};

export { processSouthCliffs };
