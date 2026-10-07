/* @layer shared-hud @kind logic */
/**
 * Pass one: what does this node want to be, bottom-up.
 *
 * An element wants its intrinsic size; a container wants whatever its children
 * came to plus its own padding, and both are then multiplied by the node's own
 * `scale`. An explicit pixel size overrides the answer - that is what "set the
 * box" means - while `pct` and `fill` cannot be answered here at all, because
 * they are stated against a parent this pass has not met yet. They resolve in
 * `place` / `place-grid`, and until then the node measures at its natural size,
 * which is what a percentage means to intrinsic sizing everywhere else.
 *
 * BINDABLE BOXES RESOLVE HERE FIRST. `scale`, `visible`, `size.w`/`size.h` and
 * `min`/`max` may all be a `Value`; every read of one goes through
 * `resolve-box.ts` so a document with no bound values measures exactly as it
 * always did and a bound one is just as real to this pass.
 *
 * Nothing here reads a view, an anchor or a screen. Two nodes with the same
 * subtree and the same context measure identically wherever they end up.
 */

import { flowGaps, insetsOf, linesSize, toLines } from './flow';
import { gridContentSize } from './place-grid';
import { clampToBox, resolveGap, resolveScale, resolveVisible } from './resolve-box';
import { intrinsicSize } from './intrinsic-size';
import { resolveValue } from '../data/resolve-value';
import type { Extent, HudContainer, HudNode } from '../../types/hud/hud-node';
import type { FlowItem } from './flow';
import type { MeasureContext } from './engine.type';
import type { Size } from '../layouts/geometry.type';

/** A length this pass can answer without a parent: a fixed `px`, or the bare
 *  expression that is `px` shorthand. `pct` and `fill` are not - they need a
 *  real available space, which arrives in `place`. */
const pxOf = (extent: Extent | undefined, ctx: MeasureContext): number | undefined => {
  if (!extent || typeof extent !== 'object') return undefined;
  const scope = ctx.scope ?? {};
  if ('expr' in extent) return resolveValue(extent, scope);
  if ('px' in extent) return resolveValue(extent.px, scope);
  return undefined;
};

/** Every child that takes part in the flow, measured, with its margins. */
const flowItems = (container: HudContainer, ctx: MeasureContext): FlowItem[] =>
  container.children
    .filter((child) => resolveVisible(child, ctx))
    .map((child) => ({ node: child, size: measureBox(child, ctx), margin: insetsOf(child.margin) }));

/** What a container holds, in the container's own coordinates, padding included. */
const contentSize = (node: HudNode, ctx: MeasureContext): Size => {
  if (node.kind === 'element') return intrinsicSize(node.element, ctx);
  const pad = insetsOf(node.padding);
  let inner: Size;
  if (node.layout === 'grid') {
    inner = gridContentSize(node, ctx);
  } else {
    const items = flowItems(node, ctx);
    const row = node.direction === 'row';
    const gap = flowGaps(resolveGap(node, ctx), row);
    inner = linesSize(toLines(items, row, gap.main, false, Number.POSITIVE_INFINITY), row, gap.cross);
  }
  return { w: inner.w + pad.left + pad.right, h: inner.h + pad.top + pad.bottom };
};

/** The node's own box, in its PARENT's coordinates: content times scale, unless
 *  a pixel size was asked for - then clamped to whatever `min`/`max` say. */
const measureBox = (node: HudNode, ctx: MeasureContext = {}): Size => {
  const scale = resolveScale(node, ctx);
  const content = contentSize(node, ctx);
  const w = pxOf(node.size?.w, ctx) ?? content.w * scale;
  const h = pxOf(node.size?.h, ctx) ?? content.h * scale;
  return { w: clampToBox(node, 'w', w, ctx), h: clampToBox(node, 'h', h, ctx) };
};

/** The box plus its margins - what the node costs the flow it sits in, and what
 *  a region's anchor is applied to. */
const outerSize = (node: HudNode, ctx: MeasureContext = {}): Size => {
  const box = measureBox(node, ctx);
  const m = insetsOf(node.margin);
  return { w: box.w + m.left + m.right, h: box.h + m.top + m.bottom };
};

export { contentSize, flowItems, measureBox, outerSize, pxOf };
