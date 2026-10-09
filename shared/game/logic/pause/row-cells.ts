/* @layer shared-game @kind logic */
import type { RowCell, RowSegment } from './pause.type';

const rowCells = (row: readonly RowSegment[]): RowCell[] =>
  row
    .flatMap((seg) => Array.from({ length: seg.length }, (_, i) => ({
      section: seg.section, cursor: seg.start + i, column: seg.column + i,
    })))
    .sort((a, b) => a.column - b.column);

export { rowCells };
