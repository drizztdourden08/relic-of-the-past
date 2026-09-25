/* @layer shared-hud @kind logic */
/**
 * The second placement engine, beside the flex flow: two axes, position-
 * driven. Right for a consumables block, a status page, anything that must
 * line up across rows and along them.
 *
 * TWO PASSES, like the flex engine's own split between `measure.ts` and
 * `place-flow.ts`. `gridContentSize` answers "how big is this grid, unbounded"
 * for the bottom-up pass; `childBoxesGrid` answers "where does every child go"
 * once a real box has arrived from above. Both share the same cell assignment
 * and track sizing (`grid-cells.ts`) - which child sits in which cell, and how
 * big a track is, never depends on whether the pass is bounded.
 *
 * `alignSelf` overrides BOTH `justifyItems` and `alignItems` for one child;
 * `justifySelf` beside it takes the inline axis back on its own. One field
 * still says "align this child", and the second only exists because a cell
 * whose two bands disagree cannot be said with one word (§42 - the screen's
 * top-centre child is `center` across and `start` down).
 *
 * CHILDREN ARE PLACED IN `order`, THEN DOCUMENT ORDER (`inOrder`, the same
 * function the flex engine sorts a line with), because that is the PAINT
 * order and co-placed children are the normal case here: an overlay is a grid
 * whose children share a cell, and the sprite has to land on the glyph.
 */

import {
  assignCells, inOrder, naturalPerTrack, offsetsOf, rowCountOf, sizeTracks, spanSize, tracksOf,
} from './grid-cells';
import { insetsOf } from './flow';
import { measureBox } from './measure';
import { resolveExtent } from './resolve-extent';
import { clampToBox, resolveGap, resolveVisible } from './resolve-box';
import type { HudGridContainer, HudGridJustifyItems, HudNode } from '../../types/hud/hud-node';
import type { ChildBox } from './place-flow';
import type { MeasureContext } from './engine.type';
import type { Rect, Size } from '../layouts/geometry.type';

/** How big this grid is, unbounded - the natural-size half of `measure.ts`'s
 *  bottom-up pass. */
const gridContentSize = (container: HudGridContainer, ctx: MeasureContext): Size => {
  const visible = inOrder(container.children).filter((child) => resolveVisible(child, ctx));
  const cells = assignCells(visible, Math.max(1, container.columns.length));
  const rows = rowCountOf(cells.values());
  const { columns, rows: rowTracks } = tracksOf(container, rows);
  const gap = resolveGap(container, ctx);
  const colSizes = sizeTracks(columns, naturalPerTrack(columns.length, cells, 'column', ctx), Infinity, gap.x, ctx);
  const rowSizes = sizeTracks(rowTracks, naturalPerTrack(rowTracks.length, cells, 'row', ctx), Infinity, gap.y, ctx);
  const w = colSizes.reduce((sum, v) => sum + v, 0) + gap.x * Math.max(0, colSizes.length - 1);
  const h = rowSizes.reduce((sum, v) => sum + v, 0) + gap.y * Math.max(0, rowSizes.length - 1);
  return { w, h };
};

/** One child's own box within its cell: `alignSelf` overrides the container's
 *  item alignment for both axes and `justifySelf` overrides the inline one
 *  alone; unset resolves 'stretch', the one place `hud-node.ts` gives that
 *  word real meaning. */
const placeInCell = (
  node: HudNode, cellW: number, cellH: number, ctx: MeasureContext,
  justifyItems: HudGridJustifyItems, alignItems: HudGridJustifyItems,
): { w: number; h: number; x: number; y: number } => {
  const margin = insetsOf(node.margin);
  const innerW = Math.max(0, cellW - margin.left - margin.right);
  const innerH = Math.max(0, cellH - margin.top - margin.bottom);
  const natural = measureBox(node, ctx);
  const justify = node.justifySelf ?? node.alignSelf ?? justifyItems;
  const align = node.alignSelf ?? alignItems;
  const wExtent = node.size?.w ?? (justify === 'stretch' ? 'fill' : 'auto');
  const hExtent = node.size?.h ?? (align === 'stretch' ? 'fill' : 'auto');
  const rawW = resolveExtent(wExtent, natural.w, innerW, ctx);
  const rawH = resolveExtent(hExtent, natural.h, innerH, ctx);
  const w = clampToBox(node, 'w', rawW === 'fill' ? innerW : rawW, ctx);
  const h = clampToBox(node, 'h', rawH === 'fill' ? innerH : rawH, ctx);
  const freeW = innerW - w;
  const freeH = innerH - h;
  const x = margin.left + (justify === 'center' ? freeW / 2 : justify === 'end' ? freeW : 0);
  const y = margin.top + (align === 'center' ? freeH / 2 : align === 'end' ? freeH : 0);
  return { w, h, x, y };
};

/** Everything a placed grid is: its content area, who sits where, and how big
 *  every track came out. Shared by the child boxes and by the CELL RECTANGLES
 *  the editor's drop indicator draws, so a cell the author aims at can never be
 *  a different rectangle from the cell a child lands in. */
const solveGrid = (container: HudGridContainer, box: Rect, unit: number, ctx: MeasureContext) => {
  const pad = insetsOf(container.padding);
  const area: Rect = {
    x: box.x + pad.left * unit,
    y: box.y + pad.top * unit,
    w: Math.max(0, box.w - (pad.left + pad.right) * unit),
    h: Math.max(0, box.h - (pad.top + pad.bottom) * unit),
  };
  const visible = inOrder(container.children).filter((child) => resolveVisible(child, ctx));
  const cells = assignCells(visible, Math.max(1, container.columns.length));
  const { columns, rows: rowTracks } = tracksOf(container, rowCountOf(cells.values()));
  const gap = resolveGap(container, ctx);
  const colSizes = sizeTracks(columns, naturalPerTrack(columns.length, cells, 'column', ctx), area.w / unit, gap.x, ctx);
  const rowSizes = sizeTracks(rowTracks, naturalPerTrack(rowTracks.length, cells, 'row', ctx), area.h / unit, gap.y, ctx);
  return {
    area, visible, cells, gap, colSizes, rowSizes,
    colOffsets: offsetsOf(colSizes, gap.x),
    rowOffsets: offsetsOf(rowSizes, gap.y),
  };
};

/** One cell of a placed grid, in view pixels. `implicit` marks the ONE row past
 *  the last declared one: a grid grows rows and never columns, so that row is
 *  offered as a drop target while a fourth COLUMN never is. */
interface GridCellRect { column: number; row: number; implicit: boolean; rect: Rect }

/**
 * Every cell of one grid container, in view pixels. This is the drop indicator's
 * own geometry, solved by the same tracks the children were placed by, not
 * inferred from where the children happened to land. A column with no child in
 * it still has a rectangle, which is exactly the case an editor has to be able
 * to point at.
 */
const gridCellRects = (container: HudGridContainer, box: Rect, unit: number, ctx: MeasureContext): GridCellRect[] => {
  const { area, gap, colSizes, rowSizes, colOffsets, rowOffsets } = solveGrid(container, box, unit, ctx);
  const cellAt = (ci: number, row: number, y: number, h: number): GridCellRect => ({
    column: ci + 1,
    row,
    implicit: row > rowSizes.length,
    rect: { x: area.x + (colOffsets[ci] ?? 0) * unit, y, w: colSizes[ci] * unit, h },
  });
  const out = rowSizes.flatMap((rh, ri) =>
    colSizes.map((_, ci) => cellAt(ci, ri + 1, area.y + rowOffsets[ri] * unit, rh * unit)));
  const usedH = (rowOffsets.at(-1) ?? 0) + (rowSizes.at(-1) ?? 0) + gap.y;
  const leftover = area.h / unit - usedH;
  if (leftover <= 0) return out;
  return [...out, ...colSizes.map((_, ci) => cellAt(ci, rowSizes.length + 1, area.y + usedH * unit, leftover * unit))];
};

/** Every child of one grid container, boxed, in view pixels. */
const childBoxesGrid = (container: HudGridContainer, box: Rect, unit: number, ctx: MeasureContext): ChildBox[] => {
  const { area, visible, cells, gap, colSizes, rowSizes, colOffsets, rowOffsets } = solveGrid(container, box, unit, ctx);
  const justifyItems = container.justifyItems ?? 'stretch';
  const alignItems = container.alignItems ?? 'stretch';

  // A zero-width or zero-height child draws nothing and leaves the flow, the
  // same rule the flex engine follows (`place-flow.ts`'s `collapsed`) - a
  // bound size that resolves to nothing is not a hole held open in a cell.
  return visible.flatMap((node) => {
    const cell = cells.get(node);
    if (!cell) return [];
    const colIndex = cell.column - 1;
    const rowIndex = cell.row - 1;
    const cellW = spanSize(colSizes, colIndex, cell.colSpan, gap.x);
    const cellH = spanSize(rowSizes, rowIndex, cell.rowSpan, gap.y);
    const cellX = area.x + (colOffsets[colIndex] ?? 0) * unit;
    const cellY = area.y + (rowOffsets[rowIndex] ?? 0) * unit;
    const placed = placeInCell(node, cellW, cellH, ctx, justifyItems, alignItems);
    if (placed.w <= 0 || placed.h <= 0) return [];
    return [{
      node,
      box: { x: cellX + placed.x * unit, y: cellY + placed.y * unit, w: placed.w * unit, h: placed.h * unit },
    }];
  });
};

export { childBoxesGrid, gridCellRects, gridContentSize, solveGrid };
export type { GridCellRect };
