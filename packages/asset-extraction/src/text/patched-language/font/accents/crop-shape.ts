/* @layer shared-asset-extraction @kind logic */
import type { PixelGrid, Shape } from './accents.type';
import { cellAt } from './cell-at';

const inkRows = (grid: PixelGrid): number[] =>
  grid.flatMap((row, index) => (row.some((cell) => cell !== 0) ? [index] : []));

const inkCols = (grid: PixelGrid): number[] => {
  const width = grid[0]?.length ?? 0;
  return Array.from({ length: width }, (_, col) => col).filter((col) => grid.some((row) => (row[col] ?? 0) !== 0));
};

const cropShape = (grid: PixelGrid): Shape | null => {
  const rows = inkRows(grid);
  const cols = inkCols(grid);
  const top = rows[0];
  const bottom = rows[rows.length - 1];
  const left = cols[0];
  const right = cols[cols.length - 1];
  if (top === undefined || bottom === undefined || left === undefined || right === undefined) return null;
  const height = bottom - top + 1;
  const width = right - left + 1;
  const cells = Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (__, col) => cellAt(grid, top + row, left + col)));
  return { top, height, width, cells };
};

export { cropShape, inkRows };
