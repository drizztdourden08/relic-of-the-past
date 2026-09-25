/* @layer shared-hud @kind logic */
/**
 * Grid arithmetic that does not need a real box: which child sits in which
 * cell, and how big each track is. `place-grid.ts` is the other half - the
 * two passes that turn this into rectangles.
 *
 * CELL ASSIGNMENT NEVER DEPENDS ON HOW MUCH ROOM THE GRID WAS GIVEN, so it is
 * the one piece both the unbounded measure pass and the real placement pass
 * can share without disagreeing about which child goes where.
 *
 * AN EXPLICIT CELL IS NEVER REFUSED FOR BEING TAKEN. Every overlay in this
 * project is a grid whose children all name the same cell (§42 - what
 * `direction: 'stack'` used to be), so two, four or five children sharing
 * (1,1) is the ordinary case, not a conflict. The `occupied` set is
 * therefore ONE-WAY: an explicit placement writes into it, and only AUTO-FLOW
 * reads it, so the cursor still walks past whatever has been claimed.
 *
 * DOCUMENTED SIMPLIFICATIONS:
 *  - An `auto` track is sized to the largest OUTER size (box plus margins,
 *    negatives included) among the SPAN-1 items whose cell starts in it. A
 *    spanning item does not contribute - real CSS Grid's spanning-item
 *    distribution is a second algorithm this phase does not need yet.
 *  - `place`'s column/row must be given TOGETHER or not at all; a partial
 *    placement is treated as no placement and the child is auto-flowed.
 */

import { outerSize } from './measure';
import { resolveExtent } from './resolve-extent';
import type { Extent, HudGridContainer, HudNode } from '../../types/hud/hud-node';
import type { MeasureContext } from './engine.type';

interface GridCell { column: number; row: number; colSpan: number; rowSpan: number }

const span = (node: HudNode, key: 'colSpan' | 'rowSpan'): number => Math.max(1, node.place?.[key] ?? 1);

/** `order`, then document order. ONE rule for both engines: it is the
 *  auto-flow's visiting order, and it is the paint order co-placed children
 *  are stacked in - the item sprite over the glyph it sits on. */
const inOrder = (children: readonly HudNode[]): HudNode[] =>
  children
    .map((node, index) => ({ node, index }))
    .sort((a, b) => (a.node.order ?? 0) - (b.node.order ?? 0) || a.index - b.index)
    .map((entry) => entry.node);

/** Every child, assigned a cell: explicit `place` (column AND row together)
 *  wins; everything else auto-flows row-major, in `order`, into the next run
 *  of free cells its span needs. */
const assignCells = (children: readonly HudNode[], columns: number): Map<HudNode, GridCell> => {
  const cells = new Map<HudNode, GridCell>();
  const occupied = new Set<string>();
  const key = (c: number, r: number): string => `${c},${r}`;
  const mark = (cell: GridCell): void => {
    for (let r = cell.row; r < cell.row + cell.rowSpan; r += 1) {
      for (let c = cell.column; c < cell.column + cell.colSpan; c += 1) occupied.add(key(c, r));
    }
  };
  const ordered = inOrder(children);

  ordered.forEach((node) => {
    const place = node.place;
    if (place?.column === undefined || place.row === undefined) return;
    const cell: GridCell = {
      column: place.column, row: place.row, colSpan: span(node, 'colSpan'), rowSpan: span(node, 'rowSpan'),
    };
    cells.set(node, cell);
    mark(cell);
  });

  let cursorRow = 1;
  let cursorCol = 1;
  const fits = (col: number, row: number, colSpan: number, rowSpan: number): boolean => {
    if (col + colSpan - 1 > columns) return false;
    for (let r = row; r < row + rowSpan; r += 1) {
      for (let c = col; c < col + colSpan; c += 1) if (occupied.has(key(c, r))) return false;
    }
    return true;
  };

  ordered.forEach((node) => {
    if (cells.has(node)) return;
    const colSpan = span(node, 'colSpan');
    const rowSpan = span(node, 'rowSpan');
    for (;;) {
      if (cursorCol + colSpan - 1 > columns) { cursorCol = 1; cursorRow += 1; }
      if (fits(cursorCol, cursorRow, colSpan, rowSpan)) break;
      cursorCol += 1;
    }
    const cell: GridCell = { column: cursorCol, row: cursorRow, colSpan, rowSpan };
    cells.set(node, cell);
    mark(cell);
    cursorCol += colSpan;
  });

  return cells;
};

/** Rows are implicit when `container.rows` is omitted: as many `auto` tracks
 *  as the assignment needs. */
const rowCountOf = (cells: Iterable<GridCell>): number => {
  let count = 0;
  for (const cell of cells) count = Math.max(count, cell.row + cell.rowSpan - 1);
  return count;
};

const tracksOf = (container: HudGridContainer, rows: number): { columns: Extent[]; rows: Extent[] } => ({
  columns: container.columns,
  rows: container.rows ?? Array.from({ length: Math.max(1, rows) }, () => 'auto' as const),
});

/** The natural size of one track: the largest OUTER size - box plus margins -
 *  among the span-1 items that start in it. Margins count because a cell has
 *  to hold them (`place-grid.ts` insets by them again to find the child's own
 *  box), and because a negative one is how a sprite hangs outside the group it
 *  belongs to without opening the group up by its own width. */
const naturalPerTrack = (
  count: number, cells: Map<HudNode, GridCell>, axis: 'column' | 'row', ctx: MeasureContext,
): number[] => {
  const sizes = new Array(count).fill(0) as number[];
  cells.forEach((cell, node) => {
    const spanSizeOf = axis === 'column' ? cell.colSpan : cell.rowSpan;
    if (spanSizeOf !== 1) return;
    const index = (axis === 'column' ? cell.column : cell.row) - 1;
    if (index < 0 || index >= count) return;
    const natural = outerSize(node, ctx);
    sizes[index] = Math.max(sizes[index], axis === 'column' ? natural.w : natural.h);
  });
  return sizes;
};

/** Every track's size, given each track's natural content size and the real
 *  space available (`Infinity` for the unbounded measure pass). `fill` tracks
 *  share whatever is left after every fixed and `auto` track and every gap;
 *  unbounded, a `fill` track has nothing to share and measures at 0 - the same
 *  reading a `fill` CHILD gets in the flex engine's own measure pass. */
const sizeTracks = (
  tracks: readonly Extent[], natural: readonly number[], available: number, gap: number, ctx: MeasureContext,
): number[] => {
  const resolved = tracks.map((track, i) => resolveExtent(track, natural[i], available, ctx));
  if (!Number.isFinite(available)) return resolved.map((v) => (v === 'fill' ? 0 : v));
  const gapTotal = gap * Math.max(0, tracks.length - 1);
  const fixedTotal = resolved.reduce((sum: number, v) => sum + (v === 'fill' ? 0 : v), 0);
  const fillCount = resolved.filter((v) => v === 'fill').length;
  const leftover = fillCount ? Math.max(0, available - fixedTotal - gapTotal) / fillCount : 0;
  return resolved.map((v) => (v === 'fill' ? leftover : v));
};

/** Cumulative offsets - track `i` starts after every earlier track and gap. */
const offsetsOf = (sizes: readonly number[], gap: number): number[] => {
  const out: number[] = [];
  let pen = 0;
  sizes.forEach((size) => {
    out.push(pen);
    pen += size + gap;
  });
  return out;
};

const spanSize = (sizes: readonly number[], start: number, count: number, gap: number): number => {
  let total = 0;
  for (let i = start; i < start + count && i < sizes.length; i += 1) total += sizes[i];
  return total + gap * Math.max(0, count - 1);
};

export {
  assignCells, inOrder, naturalPerTrack, offsetsOf, rowCountOf, sizeTracks, spanSize, tracksOf,
};
export type { GridCell };
