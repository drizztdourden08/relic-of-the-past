/* @layer shared-asset-extraction @kind logic */
import { NEIGHBOURS } from './accents.constants';
import type { Shape } from './accents.type';
import { cellAt } from './cell-at';

const fill = (shape: Shape, seen: Set<string>, start: readonly [number, number]): void => {
  const stack: (readonly [number, number])[] = [start];
  while (stack.length > 0) {
    const cell = stack.pop();
    if (!cell) return;
    const [row, col] = cell;
    const key = `${row},${col}`;
    if (seen.has(key) || cellAt(shape.cells, row, col) === 0) continue;
    seen.add(key);
    NEIGHBOURS.forEach(([down, right]) => stack.push([row + down, col + right]));
  }
};

const componentCount = (shape: Shape): number => {
  const seen = new Set<string>();
  let count = 0;
  for (let row = 0; row < shape.height; row += 1) {
    for (let col = 0; col < shape.width; col += 1) {
      if (cellAt(shape.cells, row, col) === 0 || seen.has(`${row},${col}`)) continue;
      count += 1;
      fill(shape, seen, [row, col]);
    }
  }
  return count;
};

export { componentCount };
