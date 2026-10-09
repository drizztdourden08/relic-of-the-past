/* @layer shared-game @kind logic */
import type { CursorPos, PauseContext, PauseScreen, PauseSection } from './pause.type';
import { clampCursor } from './clamp-cursor';
import { locateCell } from './locate-cell';
import { nearestInRow } from './nearest-in-row';
import { rowCells } from './row-cells';
import { screenRows } from './screen-rows';

const moveCursor = (
  screen: PauseScreen,
  section: PauseSection,
  cursor: number,
  dir: 'up' | 'down' | 'left' | 'right',
  ctx: PauseContext,
): CursorPos => {
  const rows = screenRows(screen, ctx);
  if (rows.length === 0) return { section, cursor: 0 };
  const start = clampCursor(screen, { section, cursor }, ctx);
  const pos = locateCell(rows, start);
  if (!pos) return start;

  if (dir === 'left' || dir === 'right') {
    const cells = rowCells(rows[pos.row]);
    const at = cells.findIndex((cell) => cell.column === pos.column);
    const next = (at + (dir === 'right' ? 1 : -1) + cells.length) % cells.length;
    return { section: cells[next].section, cursor: cells[next].cursor };
  }

  const target = (pos.row + (dir === 'down' ? 1 : -1) + rows.length) % rows.length;
  return nearestInRow(rows[target], pos.column);
};

export { moveCursor };
