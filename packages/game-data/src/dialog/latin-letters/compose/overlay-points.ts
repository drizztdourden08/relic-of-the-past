/* @layer shared-game @kind logic */
import { columnExtent } from '../mask/column-extent';
import type { MaskBox } from '../mask/mask.type';
import { rowExtent } from '../mask/row-extent';
import type { OverlayId } from '../latin-letters.type';

type Point = readonly [number, number];
type PointsOf = (mask: Uint8Array, box: MaskBox) => Point[] | undefined;

const middle = (box: MaskBox): number => box.top + Math.floor((box.bottom - box.top) / 2);

const span = (from: number, to: number, y: number): Point[] => {
  const points: Point[] = [];
  for (let x = from; x <= to; x++) points.push([x, y]);
  return points;
};

const line = (x0: number, y0: number, x1: number, y1: number): Point[] => {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    points.push([Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t)]);
  }
  return points;
};

const topSpan = (mask: Uint8Array, box: MaskBox) => rowExtent(mask, box.top, box.top + 2);
const bottomSpan = (mask: Uint8Array, box: MaskBox) => rowExtent(mask, box.bottom - 2, box.bottom);
const midSpan = (mask: Uint8Array, box: MaskBox) => rowExtent(mask, middle(box), middle(box));
const centreOf = (from: number, to: number): number => from + Math.floor((to - from) / 2);

const hookAt = (mask: Uint8Array, x: number, dx: number, up: boolean): Point[] | undefined => {
  const column = columnExtent(mask, x, x);
  if (column === undefined) return undefined;
  const y = up ? column.from - 1 : column.to + 1;
  const tip = up ? y - 1 : y + 1;
  return tip < 0 ? undefined : [[x, y], [x + dx, tip]];
};

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

const overlayPoints = (overlay: keyof typeof POINTS, mask: Uint8Array, box: MaskBox): Point[] | undefined =>
  POINTS[overlay](mask, box);

export { overlayPoints };
