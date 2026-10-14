/* @layer shared-hud @kind logic */
import {
  crossMargin, crossOf, flowGaps, insetsOf, mainOf, outerCross, outerMain, toLines,
} from './flow';
import { inOrder } from './grid-cells';
import { measureBox } from './measure';
import { resolveExtent } from './resolve-extent';
import { FILL } from './resolve-extent.constants';
import { clampToBox, resolveGap, resolveVisible } from './resolve-box';
import type { HudFlexContainer } from '../types/hud-node';
import type { FlowItem, Insets } from './flow';
import type { MeasureContext } from './engine.type';
import type { Rect, Size } from '../layouts/geometry.type';
import type { BoxFrame, ChildBox, FlowPlan, Pen, ShareAxis } from './place-flow.type';

const crossFill = (available: number, margin: Insets, row: boolean): number =>
  Math.max(0, available - crossMargin(margin, row));

const fillOr = (extent: number | typeof FILL, whenFill: () => number): number =>
  (extent === FILL ? whenFill() : extent);

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
    const rawW = fillOr(w, () => (row ? 0 : crossFill(available.w, margin, row)));
    const rawH = fillOr(h, () => (row ? crossFill(available.h, margin, row) : 0));
    const size = {
      w: row && mainFill ? rawW : clampToBox(child, 'w', rawW, ctx),
      h: !row && mainFill ? rawH : clampToBox(child, 'h', rawH, ctx),
    };
    items.push({ node: child, size, margin });
    fills.push(mainFill);
  });
  return { items, fills };
};

const shareRemaining = (
  items: FlowItem[],
  fills: readonly boolean[],
  flowAxis: ShareAxis,
  ctx: MeasureContext,
): void => {
  const { row, mainGap, available } = flowAxis;
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

const alignOffset = (align: HudFlexContainer['align'] | 'stretch', free: number): number => {
  if (align === 'center') return free / 2;
  if (align === 'end') return free;
  return 0;
};

const lineSpacing = (
  justify: HudFlexContainer['justify'], free: number, count: number,
): { lead: number; spread: number } => {
  if (justify === 'center') return { lead: free / 2, spread: 0 };
  if (justify === 'end') return { lead: free, spread: 0 };
  if (count > 1 && justify === 'between') return { lead: 0, spread: free / (count - 1) };
  if (count > 1 && justify === 'around') return { lead: free / (2 * count), spread: free / count };
  if (count > 1 && justify === 'evenly') return { lead: free / (count + 1), spread: free / (count + 1) };
  return { lead: 0, spread: 0 };
};

const boxOf = (item: FlowItem, pen: Pen, frame: BoxFrame): Rect => {
  const { area, unit, row } = frame;
  return {
    x: area.x + (row ? pen.main : pen.cross) * unit,
    y: area.y + (row ? pen.cross : pen.main) * unit,
    w: item.size.w * unit,
    h: item.size.h * unit,
  };
};

const flowBoxes = (container: HudFlexContainer, items: FlowItem[], plan: FlowPlan): ChildBox[] => {
  const { area, available, unit, gap } = plan;
  const row = container.direction === 'row';
  const availableMain = mainOf(available, row);
  const frame: BoxFrame = { area, unit, row };
  const lines = toLines(items, { row, mainGap: gap.main, wrap: container.wrap === true, available: availableMain });
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
      boxes.push({ node: item.node, box: boxOf(item, { main: mainPen + lead, cross }, frame) });
      mainPen += outerMain(item, row) + gap.main + spread;
    });
    crossPen += lineCross + gap.cross;
  });
  return boxes;
};

const collapsed = (item: FlowItem): boolean => item.size.w <= 0 || item.size.h <= 0;

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
  shareRemaining(items, fills, { row, mainGap: gap.main, available: mainOf(available, row) }, ctx);
  return flowBoxes(container, items.filter((item) => !collapsed(item)), { area, available, unit, gap });
};

export { childBoxes };
