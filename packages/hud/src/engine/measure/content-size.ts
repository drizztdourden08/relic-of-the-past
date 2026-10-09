/* @layer shared-hud @kind logic */
import { flowGaps, insetsOf, linesSize, toLines } from '../flow';
import { gridContentSize } from '../place-grid';
import { resolveGap } from '../resolve-box';
import { intrinsicSize } from '../intrinsic-size';
import { flowItems } from './flow-items';
import type { HudNode } from '../../types/hud-node';
import type { MeasureContext } from '../engine.type';
import type { Size } from '../../layouts/geometry.type';

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

export { contentSize };
