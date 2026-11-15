/* @layer shared-asset-extraction @kind logic */
import { NEIGHBOURS } from './accents.constants';
import type { PixelGrid } from './accents.type';
import { cellAt } from './cell-at';

const collect = (grid: PixelGrid, start: readonly [number, number]): Set<string> => {
  const seen = new Set<string>();
  const stack: (readonly [number, number])[] = [start];
  while (stack.length > 0) {
    const cell = stack.pop();
    if (!cell) break;
    const [row, col] = cell;
    const key = `${row},${col}`;
    if (seen.has(key) || cellAt(grid, row, col) === 0) continue;
    seen.add(key);
    NEIGHBOURS.forEach(([down, right]) => stack.push([row + down, col + right]));
  }
  return seen;
};

const dotlessGrid = (grid: PixelGrid): number[][] | null => {
  const top = grid.findIndex((row) => row.some((cell) => cell !== 0));
  if (top < 0) return null;
  const left = (grid[top] ?? []).findIndex((cell) => cell !== 0);
  const dot = collect(grid, [top, left]);
  const rest = grid.map((row, index) => row.map((cell, col) => (dot.has(`${index},${col}`) ? 0 : cell)));
  return rest.some((row) => row.some((cell) => cell !== 0)) ? rest : null;
};

export { dotlessGrid };
