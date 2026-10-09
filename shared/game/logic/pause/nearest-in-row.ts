/* @layer shared-game @kind logic */
import type { CursorPos, RowSegment } from './pause.type';
import { rowCells } from './row-cells';

const nearestInRow = (row: readonly RowSegment[], column: number): CursorPos => {
  const cells = rowCells(row);
  let best = cells[0];
  for (const cell of cells) {
    if (Math.abs(cell.column - column) < Math.abs(best.column - column)) best = cell;
  }
  return { section: best.section, cursor: best.cursor };
};

export { nearestInRow };
