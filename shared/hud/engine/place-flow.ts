/* @layer shared-hud @kind logic */
/**
 * Where each child of one FLEX container goes: the arithmetic of pass two,
 * with the recursion left to `place.ts`. `place-grid.ts` is the second engine,
 * beside this one - a container picks one or the other through `layout`.
 *
 * Everything in here works in the container's OWN authored units and converts
 * to the view's pixels once, through `unit` - the factor every ancestor's scale
 * has multiplied up to this point, which is what lets a subtree be authored at
 * one size and drawn at another with no number inside it changing.
 *
 * THE GAP IS `{ x, y }` HERE TOO (§57): a row separates its items by `x` and
 * its wrapped lines by `y`, a column the reverse, and `flowGaps` turns that
 * pair into the main and cross numbers this file spends. A document whose two
 * axes are equal - every migrated `gap: n` - lays out to the pixel as before.
 *
 * `fill` is resolved before wrapping, so "take what is left of this line" sees
 * fixed sizes and never produces a line whose only child wants a width the
 * line does not have. `order` sorts the children first (`inOrder`, shared with
 * the grid so one rule decides paint order under both engines); `alignSelf`
 * overrides the container's own `align` for one child.
 */

import {
  crossMargin, crossOf, flowGaps, insetsOf, mainOf, outerCross, outerMain, toLines,
} from './flow';
import { inOrder } from './grid-cells';
import { measureBox } from './measure';
import { FILL, resolveExtent } from './resolve-extent';
import { clampToBox, resolveGap, resolveVisible } from './resolve-box';
import type { HudFlexContainer, HudNode } from '../../types/hud/hud-node';
import type { FlowItem, Insets } from './flow';
import type { MeasureContext } from './engine.type';
import type { Rect, Size } from '../layouts/geometry.type';

interface ChildBox { node: HudNode; box: Rect }

/** A cross-axis `fill` is the whole cross extent less the child's own margins -
 *  there is nothing else to share it with. */
const crossFill = (available: number, margin: Insets, row: boolean): number =>
  Math.max(0, available - crossMargin(margin, row));

const sizedItems = (
  container: HudFlexContainer,
  ctx: MeasureContext,
  available: Size,
): { items: FlowItem[]; fills: boolean[] } => {
  const row = container.direction === 'row';
  const items: FlowItem[] = [];
  const fills: boolean[] = [];
  inOrder(container.children).filter((child) => resolveVisible(child, ctx)).forEach((child) => {
    const margin = insetsOf(child.margin);
    const natural = measureBox(child, ctx);
    const w = resolveExtent(child.size?.w, natural.w, available.w, ctx);
    const h = resolveExtent(child.size?.h, natural.h, available.h, ctx);
    const mainFill = (row ? w : h) === FILL;
    // The MAIN-axis fill placeholder stays unclamped here: `shareRemaining`
    // overwrites it with the real share and clamps THAT. The cross axis is
    // fully resolved the moment `crossFill` runs, so it clamps now.
    const rawW = w === FILL ? (row ? 0 : crossFill(available.w, margin, row)) : w;
    const rawH = h === FILL ? (row ? crossFill(available.h, margin, row) : 0) : h;
    const size = {
      w: row && mainFill ? rawW : clampToBox(child, 'w', rawW, ctx),
      h: !row && mainFill ? rawH : clampToBox(child, 'h', rawH, ctx),
    };
    items.push({ node: child, size, margin });
    fills.push(mainFill);
  });
  return { items, fills };
};

/** Share whatever the fixed children left over, equally, among the fillers -
 *  then clamp each share to its OWN `min`/`max`: the fix for a `fill` child
 *  that would otherwise collapse to nothing. */
const shareRemaining = (
  items: FlowItem[],
  fills: readonly boolean[],
  row: boolean,
  mainGap: number,
  available: number,
  ctx: MeasureContext,
): void => {
  const count = fills.filter(Boolean).length;
  if (count === 0) return;
  const axis = row ? 'w' : 'h';
  if (!Number.isFinite(available)) {
    items.forEach((item, index) => {
      if (fills[index]) item.size[axis] = clampToBox(item.node, axis, 0, ctx);
    });
    return;
  }
  const used = items.reduce((sum, item) => sum + outerMain(item, row), 0)
    + mainGap * Math.max(0, items.length - 1);
  const share = Math.max(0, available - used) / count;
  items.forEach((item, index) => {
    if (fills[index]) item.size[axis] = clampToBox(item.node, axis, share, ctx);
  });
};

/** `stretch` reads as `start` in a flex line - nothing here stretches a child
 *  (`hud-node.ts`'s own rule), so a stray `alignSelf: 'stretch'` degrades to
 *  the same "leave it at the line's start" every other unset value gets. */
const alignOffset = (align: HudFlexContainer['align'] | 'stretch', free: number): number => {
  if (align === 'center') return free / 2;
  if (align === 'end') return free;
  return 0;
};

/**
 * WHERE THE LINE STARTS AND HOW FAR APART ITS CHILDREN SIT, for one line's
 * leftover main-axis space. Three positions and three distributions, and the
 * three distributions are the only ones that touch `spread`:
 *
 * - `between` puts nothing at the ends and `free / (n - 1)` between each pair.
 * - `around` gives each child `free / n` of its own, HALF of it at each side,
 *   so the two end gaps are half the inner ones.
 * - `evenly` makes `n + 1` equal gaps, the two at the ends included.
 *
 * ONE CHILD FALLS BACK TO `start` UNDER ALL THREE. `between` has done that
 * since it was written (there is no pair to put anything between), and the
 * other two match it instead of inventing a centring the author did not ask
 * for. A line that overflows has a negative `free`, left to go negative, the
 * same as it always has: overflow is drawn, not clamped away.
 */
const lineSpacing = (
  justify: HudFlexContainer['justify'], free: number, count: number,
): { lead: number; spread: number } => {
  switch (justify) {
    case 'between': return count > 1 ? { lead: 0, spread: free / (count - 1) } : { lead: 0, spread: 0 };
    case 'around': return count > 1 ? { lead: free / (2 * count), spread: free / count } : { lead: 0, spread: 0 };
    case 'evenly': return count > 1 ? { lead: free / (count + 1), spread: free / (count + 1) } : { lead: 0, spread: 0 };
    case 'center': return { lead: free / 2, spread: 0 };
    case 'end': return { lead: free, spread: 0 };
    default: return { lead: 0, spread: 0 };
  }
};

const boxOf = (item: FlowItem, main: number, cross: number, area: Rect, unit: number, row: boolean): Rect => ({
  x: area.x + (row ? main : cross) * unit,
  y: area.y + (row ? cross : main) * unit,
  w: item.size.w * unit,
  h: item.size.h * unit,
});

const flowBoxes = (
  container: HudFlexContainer,
  items: FlowItem[],
  area: Rect,
  available: Size,
  unit: number,
  gap: { main: number; cross: number },
): ChildBox[] => {
  const row = container.direction === 'row';
  const availableMain = mainOf(available, row);
  const lines = toLines(items, row, gap.main, container.wrap === true, availableMain);
  const boxes: ChildBox[] = [];
  let crossPen = 0;
  lines.forEach((line) => {
    const free = availableMain - line.main;
    const { lead, spread } = lineSpacing(container.justify, free, line.items.length);
    const lineCross = lines.length === 1 ? Math.max(line.cross, crossOf(available, row)) : line.cross;
    let mainPen = lead;
    line.items.forEach((item) => {
      const lead = row ? item.margin.left : item.margin.top;
      const crossLead = row ? item.margin.top : item.margin.left;
      const align = item.node.alignSelf ?? container.align;
      const cross = crossPen + alignOffset(align, lineCross - outerCross(item, row)) + crossLead;
      boxes.push({ node: item.node, box: boxOf(item, mainPen + lead, cross, area, unit, row) });
      mainPen += outerMain(item, row) + gap.main + spread;
    });
    crossPen += lineCross + gap.cross;
  });
  return boxes;
};

/** A zero-width (or zero-height) box draws nothing and LEAVES THE FLOW, the
 *  same rule an invisible node follows - not a hole held open, not even its
 *  own gap. This is the magic bar's bound `size.w` answering "no mana shows
 *  no bar at all": at `magic_current == 0` the node is not there. */
const collapsed = (item: FlowItem): boolean => item.size.w <= 0 || item.size.h <= 0;

/** Every child of one flex container, boxed, in view pixels. */
const childBoxes = (container: HudFlexContainer, box: Rect, unit: number, ctx: MeasureContext): ChildBox[] => {
  const pad = insetsOf(container.padding);
  const area: Rect = {
    x: box.x + pad.left * unit,
    y: box.y + pad.top * unit,
    w: Math.max(0, box.w - (pad.left + pad.right) * unit),
    h: Math.max(0, box.h - (pad.top + pad.bottom) * unit),
  };
  const available: Size = { w: area.w / unit, h: area.h / unit };
  const { items, fills } = sizedItems(container, ctx, available);
  const row = container.direction === 'row';
  const gap = flowGaps(resolveGap(container, ctx), row);
  shareRemaining(items, fills, row, gap.main, mainOf(available, row), ctx);
  return flowBoxes(container, items.filter((item) => !collapsed(item)), area, available, unit, gap);
};

export { childBoxes };
export type { ChildBox };
