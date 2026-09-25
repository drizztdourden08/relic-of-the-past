/* @layer shared-game @kind logic */
/**
 * The three pause screens, their sections, and ALL cursor arithmetic. Nothing
 * else in the feature decides where the cursor goes. The reducer delegates
 * here, and the views only render what it returns.
 *
 * A screen is modelled as a list of VISUAL rows, and a row as a list of
 * segments, each segment being a run of one section's cells starting at a given
 * visual column. That one shape covers every rule at once: left/right walks the
 * row across segment boundaries and wraps at its ends, up/down steps to the
 * adjacent row (wrapping top to bottom) and lands on the nearest column there.
 *
 * It is also what makes the items grid and the bottle row behave as one thing:
 * the twenty item cells fill three rows of six and leave two cells in the
 * fourth, so the four bottle cells sit beside them in that same fourth row.
 * Moving down out of the item grid therefore spills into the bottles, and up
 * out of the bottles returns to the item cell above with no special case needed.
 *
 * "Nearest column" is also the clamp: a cursor can never land where no cell
 * exists, because the only positions ever returned come from a real segment.
 */
import { GEAR_LADDER_KINDS, gearTierCount } from './gear-tiers';
import type { PauseContext, PauseScreen, PauseSection } from './pause-machine';

interface RowSegment {
  section: PauseSection;
  /** First cursor value in this run. */
  start: number;
  length: number;
  /** Visual column of the run's first cell. */
  column: number;
}

interface CursorPos {
  section: PauseSection;
  cursor: number;
}

const ITEM_COLUMNS = 6;
const DEFAULT_ITEM_CELLS = 20;
const DEFAULT_BOTTLE_CELLS = 4;
const PASSIVE_COUNT = 4;
const ACTION_COUNT = 2;

const SCREEN_ORDER: readonly PauseScreen[] = ['items', 'gear', 'status'];

const SCREEN_SECTIONS: Record<PauseScreen, readonly PauseSection[]> = {
  items: ['items', 'bottles'],
  gear: [...GEAR_LADDER_KINDS, 'passive'],
  status: ['actions'],
};

const itemScreenRows = (ctx: PauseContext): RowSegment[][] => {
  const bottles = ctx.bottles.length || DEFAULT_BOTTLE_CELLS;
  const cells = Math.max(0, (ctx.owned.length || DEFAULT_ITEM_CELLS + bottles) - bottles);
  const rows: RowSegment[][] = [];
  let placed = false;
  for (let start = 0; start < cells; start += ITEM_COLUMNS) {
    const length = Math.min(ITEM_COLUMNS, cells - start);
    const row: RowSegment[] = [{ section: 'items', start, length, column: 0 }];
    if (length < ITEM_COLUMNS) {
      row.push({ section: 'bottles', start: 0, length: bottles, column: length });
      placed = true;
    }
    rows.push(row);
  }
  if (!placed) rows.push([{ section: 'bottles', start: 0, length: bottles, column: 0 }]);
  return rows;
};

/** One row per ladder, then the passives. Driven off `GEAR_LADDER_KINDS` rather
 *  than a second list here, so a ladder cannot arrive without a row to walk. */
const gearScreenRows = (): RowSegment[][] => [
  ...GEAR_LADDER_KINDS.map((kind) => [{ section: kind, start: 0, length: gearTierCount(kind), column: 0 }]),
  [{ section: 'passive' as PauseSection, start: 0, length: PASSIVE_COUNT, column: 0 }],
];

/**
 * The status actions are drawn SIDE BY SIDE in one strip along the foot of the
 * panel, exactly as the published wireframe shows it, so they are one row of
 * ACTION_COUNT cells, not one row each. Left/right therefore walks between
 * them and wraps at the ends, which is the movement the layout invites; up and
 * down find no other row and leave the cursor where it is.
 */
const statusScreenRows = (): RowSegment[][] =>
  [[{ section: 'actions' as PauseSection, start: 0, length: ACTION_COUNT, column: 0 }]];

const screenRows = (screen: PauseScreen, ctx: PauseContext): RowSegment[][] => {
  if (screen === 'items') return itemScreenRows(ctx);
  if (screen === 'gear') return gearScreenRows();
  return statusScreenRows();
};

const rowCells = (row: readonly RowSegment[]): { section: PauseSection; cursor: number; column: number }[] =>
  row
    .flatMap((seg) => Array.from({ length: seg.length }, (_, i) => ({
      section: seg.section, cursor: seg.start + i, column: seg.column + i,
    })))
    .sort((a, b) => a.column - b.column);

const locate = (rows: readonly RowSegment[][], pos: CursorPos): { row: number; column: number } | null => {
  // A cursor is a cell INDEX, so anything but a whole number names no cell.
  // It is the same guard `hudItemAt` applies, kept here so a fractional cursor is
  // clamped away instead of surviving as a column no row can match.
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

const firstCellOf = (rows: readonly RowSegment[][], section: PauseSection): CursorPos => {
  for (const row of rows) {
    for (const seg of row) {
      if (seg.section === section && seg.length > 0) return { section, cursor: seg.start };
    }
  }
  const fallback = rows[0]?.[0];
  return fallback ? { section: fallback.section, cursor: fallback.start } : { section, cursor: 0 };
};

const nearestInRow = (row: readonly RowSegment[], column: number): CursorPos => {
  const cells = rowCells(row);
  let best = cells[0];
  for (const cell of cells) {
    if (Math.abs(cell.column - column) < Math.abs(best.column - column)) best = cell;
  }
  return { section: best.section, cursor: best.cursor };
};

/** Sections of a screen, in the order up/down walks them. */
const sectionsOf = (screen: PauseScreen): readonly PauseSection[] => SCREEN_SECTIONS[screen];

/** The section a screen opens on. */
const firstSectionOf = (screen: PauseScreen): PauseSection => SCREEN_SECTIONS[screen][0];

/** Snaps an arbitrary section/cursor onto a real cell of the screen. */
const clampCursor = (screen: PauseScreen, pos: CursorPos, ctx: PauseContext): CursorPos => {
  const rows = screenRows(screen, ctx);
  return locate(rows, pos) ? pos : firstCellOf(rows, pos.section);
};

/**
 * The single place cursor movement is decided. Returns the new section and
 * cursor; an out-of-range input is clamped onto its section's first cell first,
 * so a caller can never drive the cursor onto a cell that does not exist.
 */
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
  const pos = locate(rows, start);
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

/** Cycles items → gear → status (or back), wrapping at both ends. */
const stepScreen = (screen: PauseScreen, dir: 'prev' | 'next'): PauseScreen => {
  const at = SCREEN_ORDER.indexOf(screen);
  const next = (at + (dir === 'next' ? 1 : -1) + SCREEN_ORDER.length) % SCREEN_ORDER.length;
  return SCREEN_ORDER[next];
};

export {
  ACTION_COUNT,
  ITEM_COLUMNS,
  PASSIVE_COUNT,
  SCREEN_ORDER,
  SCREEN_SECTIONS,
  clampCursor,
  firstSectionOf,
  moveCursor,
  sectionsOf,
  stepScreen,
};
export type { CursorPos, RowSegment };
