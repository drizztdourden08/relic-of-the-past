/* @layer shared-game @kind logic */
import type { CursorPos, GridPoint, RowSegment } from './pause.type';

const locateCell = (rows: readonly RowSegment[][], pos: CursorPos): GridPoint | null => {
  if (!Number.isInteger(pos.cursor)) return null;
  for (const [r, row] of rows.entries()) {
    for (const seg of row) {
      if (seg.section !== pos.section) continue;
      if (pos.cursor >= seg.start && pos.cursor < seg.start + seg.length) {
        return { row: r, column: seg.column + (pos.cursor - seg.start) };
      }
    }
  }
  return null;
};

export { locateCell };
