/* @layer shared-game @kind logic */
import type { CursorPos, PauseContext, PauseScreen } from './pause.type';
import { firstCellOf } from './first-cell-of';
import { locateCell } from './locate-cell';
import { screenRows } from './screen-rows';

const clampCursor = (screen: PauseScreen, pos: CursorPos, ctx: PauseContext): CursorPos => {
  const rows = screenRows(screen, ctx);
  return locateCell(rows, pos) ? pos : firstCellOf(rows, pos.section);
};

export { clampCursor };
