/* @layer shared-hud @kind logic */
import type { GridCell } from './grid-cells.type';

const rowCountOf = (cells: Iterable<GridCell>): number => {
  let count = 0;
  for (const cell of cells) count = Math.max(count, cell.row + cell.rowSpan - 1);
  return count;
};

export { rowCountOf };
