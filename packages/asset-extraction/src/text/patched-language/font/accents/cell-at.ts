/* @layer shared-asset-extraction @kind logic */
import type { PixelGrid } from './accents.type';

const cellAt = (grid: PixelGrid, row: number, col: number): number => grid[row]?.[col] ?? 0;

export { cellAt };
