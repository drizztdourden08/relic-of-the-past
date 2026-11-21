/* @layer shared-asset-extraction @kind logic */
import type { PixelGrid } from './accents.type';

const sameRow = (left: readonly number[] | undefined, right: readonly number[] | undefined): boolean =>
  left !== undefined && right !== undefined && left.every((cell, col) => cell === right[col]);

const squashedGrids = (grid: PixelGrid): number[][][] => {
  const blank = (grid[0] ?? []).map(() => 0);
  const squashed: number[][][] = [];
  for (let row = 1; row < grid.length; row += 1) {
    const current = grid[row];
    if (!current?.some((cell) => cell !== 0) || !sameRow(current, grid[row - 1])) continue;
    if (sameRow(current, grid[row + 1])) continue;
    squashed.push([...grid.filter((_, index) => index !== row).map((cells) => [...cells]), [...blank]]);
  }
  return squashed;
};

export { squashedGrids };
