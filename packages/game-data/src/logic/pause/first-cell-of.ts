/* @layer shared-game @kind logic */
import type { CursorPos, PauseSection, RowSegment } from './pause.type';

const firstCellOf = (rows: readonly RowSegment[][], section: PauseSection): CursorPos => {
  for (const row of rows) {
    for (const seg of row) {
      if (seg.section === section && seg.length > 0) return { section, cursor: seg.start };
    }
  }
  const fallback = rows[0]?.[0];
  return fallback ? { section: fallback.section, cursor: fallback.start } : { section, cursor: 0 };
};

export { firstCellOf };
