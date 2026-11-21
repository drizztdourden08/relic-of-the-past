/* @layer shared-asset-extraction @kind logic */
import type { Shape, ShapeOffset } from './accents.type';
import { cellAt } from './cell-at';

const alignedMisses = (left: Shape, right: Shape, offset: ShapeOffset): number => {
  const height = Math.max(left.height, right.height);
  const width = Math.max(left.width, right.width);
  let misses = 0;
  for (let row = -1; row <= height; row += 1) {
    for (let col = -1; col <= width; col += 1) {
      if (cellAt(left.cells, row, col) !== cellAt(right.cells, row - offset.row, col - offset.col)) misses += 1;
    }
  }
  return misses;
};

const offsets = (gap: number): number[] => (gap === 0 ? [0] : [-gap, 0, gap]);

const shapeDistance = (left: Shape, right: Shape): number => {
  const rowGap = Math.abs(left.height - right.height);
  const colGap = Math.abs(left.width - right.width);
  if (rowGap > 1 || colGap > 1) return Infinity;
  const tries = offsets(rowGap).flatMap((row) => offsets(colGap).map((col) => alignedMisses(left, right, { row, col })));
  return Math.min(...tries);
};

export { shapeDistance };
