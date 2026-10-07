/* @layer shared-hud @kind logic */
/**
 * The flow itself: how a row or a column breaks its children into lines, and
 * how big those lines are.
 *
 * Shared by both passes on purpose. `measure` asks for the lines an unbounded
 * container would produce and takes their union; `place` asks for the lines the
 * container's real box produces and walks them. One implementation means the
 * size a parent reserved and the arrangement the child drew can never disagree,
 * which is the whole class of defect the flat model kept producing.
 *
 * Axis-agnostic: everything is main and cross, and `row` decides which is which.
 * A column is a row turned ninety degrees and nothing else.
 *
 * TWO GAPS, NOT ONE (§57). Every function here that spaces something takes the
 * gap for the axis it is spacing: `toLines`/`lineOf` space ITEMS along the main
 * axis, `linesSize` stacks LINES along the cross axis. The flow always did both
 * - it just spent one number on them, which is what made a flex container's gap
 * a different property from a grid's for no reason anyone could state.
 */

import type { Edges, HudNode } from '../../types/hud/hud-node';
import type { Size } from '../layouts/geometry.type';

interface Insets { top: number; right: number; bottom: number; left: number }

const insetsOf = (edges?: Edges): Insets => ({
  top: edges?.top ?? 0,
  right: edges?.right ?? 0,
  bottom: edges?.bottom ?? 0,
  left: edges?.left ?? 0,
});

/** One child, measured, with the margins it carries into the flow. */
interface FlowItem { node: HudNode; size: Size; margin: Insets }

interface FlowLine { items: FlowItem[]; main: number; cross: number }

const mainOf = (size: Size, row: boolean): number => (row ? size.w : size.h);
const crossOf = (size: Size, row: boolean): number => (row ? size.h : size.w);
const mainMargin = (m: Insets, row: boolean): number => (row ? m.left + m.right : m.top + m.bottom);
const crossMargin = (m: Insets, row: boolean): number => (row ? m.top + m.bottom : m.left + m.right);

/** What an item costs the line: its box plus the margins on that axis. */
const outerMain = (item: FlowItem, row: boolean): number =>
  mainOf(item.size, row) + mainMargin(item.margin, row);
const outerCross = (item: FlowItem, row: boolean): number =>
  crossOf(item.size, row) + crossMargin(item.margin, row);

const lineOf = (items: FlowItem[], row: boolean, mainGap: number): FlowLine => ({
  items,
  main: items.reduce((sum, item) => sum + outerMain(item, row), 0) + mainGap * Math.max(0, items.length - 1),
  cross: items.reduce((tallest, item) => Math.max(tallest, outerCross(item, row)), 0),
});

/**
 * WHICH OF A CONTAINER'S TWO GAPS IS THE MAIN ONE. `x` is always horizontal and
 * `y` always vertical (`hud-node.ts`'s `HudGap`), so a ROW separates its items
 * by `x` and its wrapped lines by `y`, and a COLUMN does the reverse. This is
 * the whole of the direction-awareness: everything else here is main and cross.
 */
const flowGaps = (gap: { x: number; y: number }, row: boolean): { main: number; cross: number } =>
  (row ? { main: gap.x, cross: gap.y } : { main: gap.y, cross: gap.x });

/** Rounding slack, so a child that fits exactly is never wrapped by a float. */
const EPSILON = 1e-6;

/**
 * Break the children into lines. Without `wrap` there is exactly one line
 * however long it is - an overflowing row is visible, and visible is what an
 * author can correct.
 */
const toLines = (
  items: readonly FlowItem[],
  row: boolean,
  mainGap: number,
  wrap: boolean,
  available: number,
): FlowLine[] => {
  if (!wrap || !Number.isFinite(available)) return items.length ? [lineOf([...items], row, mainGap)] : [];
  const lines: FlowLine[] = [];
  let current: FlowItem[] = [];
  let main = 0;
  items.forEach((item) => {
    const own = outerMain(item, row);
    const next = current.length ? main + mainGap + own : own;
    if (current.length && next > available + EPSILON) {
      lines.push(lineOf(current, row, mainGap));
      current = [item];
      main = own;
      return;
    }
    current.push(item);
    main = next;
  });
  if (current.length) lines.push(lineOf(current, row, mainGap));
  return lines;
};

/** The box every line together occupies: longest line by the stack of them,
 *  the lines themselves separated by the CROSS gap. */
const linesSize = (lines: readonly FlowLine[], row: boolean, crossGap: number): Size => {
  const main = lines.reduce((longest, line) => Math.max(longest, line.main), 0);
  const cross = lines.reduce((sum, line) => sum + line.cross, 0) + crossGap * Math.max(0, lines.length - 1);
  return row ? { w: main, h: cross } : { w: cross, h: main };
};

export {
  crossMargin, crossOf, flowGaps, insetsOf, lineOf, linesSize, mainMargin, mainOf, outerCross, outerMain,
  toLines,
};
export type { FlowItem, FlowLine, Insets };
