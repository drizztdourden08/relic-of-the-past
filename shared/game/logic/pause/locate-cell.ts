/* @layer shared-game @kind logic */
import type { CursorPos, GridPoint, RowSegment } from './pause.type';

const locateCell = (rows: readonly RowSegment[][], pos: CursorPos): GridPoint | null => {
  if (!Number.isInteger(pos.cursor)) return null;
  for (let r = 0; r < rows.length; r += 1) {
    for (const seg of rows[r]) {
      if (seg.section !== pos.section) continue;
      if (pos.cursor >= seg.start && pos.cursor < seg.start + seg.length) {
        return { row: r, column: seg.column + (pos.cursor - seg.start) };
      }
    }
  }
  return null;
};

export { locateCell };
