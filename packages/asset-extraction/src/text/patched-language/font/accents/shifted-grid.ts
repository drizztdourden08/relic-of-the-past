/* @layer shared-asset-extraction @kind logic */
import type { PixelGrid } from './accents.type';
import { cellAt } from './cell-at';

const shiftedGrid = (grid: PixelGrid, shift: number): number[][] =>
  grid.map((row, index) => row.map((_, col) => cellAt(grid, index - shift, col)));

export { shiftedGrid };
