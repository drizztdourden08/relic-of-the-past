/* @layer shared-game @kind logic */
import type { BrowsingState, CursorPos, PauseContext, RowSegment } from './pause.type';
import { clampCursor } from './clamp-cursor';
import { locateCell } from './locate-cell';
import { nearestInRow } from './nearest-in-row';
import { rowCells } from './row-cells';
import { screenRows } from './screen-rows';

const rowAt = (rows: readonly RowSegment[][], index: number): RowSegment[] => {
  const row = rows[index];
  if (row === undefined) throw new Error(`no pause row at ${index}`);
  return row;
};

const stepInRow = (row: readonly RowSegment[], column: number, dir: 'left' | 'right'): CursorPos => {
  const cells = rowCells(row);
  const at = cells.findIndex((cell) => cell.column === column);
  const next = (at + (dir === 'right' ? 1 : -1) + cells.length) % cells.length;
  const cell = cells[next];
  if (cell === undefined) throw new Error(`no pause cell at ${next}`);
  return { section: cell.section, cursor: cell.cursor };
};

const moveCursor = (
  place: Pick<BrowsingState, 'screen' | 'section' | 'cursor'>,
  dir: 'up' | 'down' | 'left' | 'right',
  ctx: PauseContext,
): CursorPos => {
  const { screen, section, cursor } = place;
  const rows = screenRows(screen, ctx);
  if (rows.length === 0) return { section, cursor: 0 };
  const start = clampCursor(screen, { section, cursor }, ctx);
  const pos = locateCell(rows, start);
  if (!pos) return start;

  if (dir === 'left' || dir === 'right') return stepInRow(rowAt(rows, pos.row), pos.column, dir);

  const target = (pos.row + (dir === 'down' ? 1 : -1) + rows.length) % rows.length;
  return nearestInRow(rowAt(rows, target), pos.column);
};

export { moveCursor };
