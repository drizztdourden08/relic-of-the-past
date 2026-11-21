/* @layer shared-game @kind constants */
import { rowExtent } from '../mask/row-extent';
import type { OverlayId } from '../latin-letters.type';
import type { PointsOf } from './compose.type';
import { bottomSpan } from './overlay-bottom-span';
import { centreOf } from './overlay-centre-of';
import { hookAt } from './overlay-hook-at';
import { line } from './overlay-line';
import { middle } from './overlay-middle';
import { midSpan } from './overlay-mid-span';
import { span } from './overlay-span';
import { topSpan } from './overlay-top-span';

const POINTS: Readonly<Record<Exclude<OverlayId, 'apostropheLeft' | 'dotless'>, PointsOf>> = {
  slash: (_mask, box) => line(box.left, box.bottom + 1, box.right, box.top - 1),
  stroke: (mask, box) => {
    const top = topSpan(mask, box);
    if (top === undefined) return undefined;
    const x = centreOf(top.from, top.to);
    const y = middle(box);
    return [[x - 1, y + 1], [x, y], [x + 1, y - 1], [x + 2, y - 2]];
  },
  barAscender: (mask, box) => {
    const top = topSpan(mask, box);
    return top === undefined ? undefined : span(top.from - 1, top.to + 1, box.top + 2);
  },
  barStem: (mask, box) => {
    const top = topSpan(mask, box);
    if (top === undefined) return undefined;
    const x = centreOf(top.from, top.to);
    return span(x - 1, x + 1, middle(box));
  },
  barLeftStem: (mask, box) => {
    const mid = midSpan(mask, box);
    return mid === undefined ? undefined : span(mid.from - 1, mid.from + 2, middle(box));
  },
  barCenter: (_mask, box) => span(box.left - 1, box.right + 1, middle(box)),
  barRight: (mask, box) => {
    const mid = midSpan(mask, box);
    return mid === undefined ? undefined : span(mid.to - 2, mid.to + 1, middle(box));
  },
  middleDot: (mask, box) => {
    const y = box.bottom - 4;
    const near = rowExtent(mask, y - 1, y + 1);
    return near === undefined ? undefined : [[near.to + 2, y]];
  },
  apostropheRight: (mask, box) => {
    const top = topSpan(mask, box);
    return top === undefined ? undefined : [[top.to + 2, box.top], [top.to + 2, box.top + 1]];
  },
  horn: (mask, box) => {
    const top = topSpan(mask, box);
    return top === undefined ? undefined : hookAt(mask, top.to, 1, true);
  },
  hookTopLeft: (mask, box) => {
    const top = topSpan(mask, box);
    return top === undefined ? undefined : hookAt(mask, top.from, -1, true);
  },
  hookBelowRight: (mask, box) => {
    const bottom = bottomSpan(mask, box);
    return bottom === undefined ? undefined : hookAt(mask, bottom.to, -1, false);
  },
  hookBelowLeft: (mask, box) => {
    const bottom = bottomSpan(mask, box);
    return bottom === undefined ? undefined : hookAt(mask, bottom.from, -1, false);
  },
};

export { POINTS };
