/* @layer shared-asset-extraction @kind logic */
import type { PixelGrid } from './accents.type';

const inkRows = (grid: PixelGrid): number[] =>
  grid.flatMap((row, index) => (row.some((cell) => cell !== 0) ? [index] : []));

export { inkRows };
