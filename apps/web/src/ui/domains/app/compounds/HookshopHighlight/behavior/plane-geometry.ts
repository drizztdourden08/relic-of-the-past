/* @layer renderer-components @kind logic */
/** Small plane helpers for the Hookshop highlight's layout, in mascot pixels and degrees. */
import type { PartName, PlacedPart, Point } from '../HookshopHighlight.type';

const FAR = 500;

const rad = (deg: number) => (deg * Math.PI) / 180;

/** `p` turned by `deg` around `centre`. */
const turn = ([x, y]: Point, [cx, cy]: Point, deg: number): Point => {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};

const unit = (a: Point, b: Point): Point => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
};

/** The half of the plane on the left of the line from `a` to `b`, as a polygon well past the scene. */
const nearSideOf = (a: Point, b: Point): Point[] => {
  const d = unit(a, b);
  const n: Point = [-d[1], d[0]];
  const top: Point = [a[0] - d[0] * FAR, a[1] - d[1] * FAR];
  const bottom: Point = [b[0] + d[0] * FAR, b[1] + d[1] * FAR];
  return [top, bottom, [bottom[0] + n[0] * FAR, bottom[1] + n[1] * FAR], [top[0] + n[0] * FAR, top[1] + n[1] * FAR]];
};

const placed = <P extends PartName>(part: P, left: number, top: number, width: number, height: number, angle = 0, origin: Point = [width / 2, height / 2]): PlacedPart<P> =>
  ({ part, left, top, width, height, angle, originX: origin[0], originY: origin[1] });

/** The right-most x a placed part reaches once turned. */
const rightmost = (p: PlacedPart): number => {
  const pivot: Point = [p.left + p.originX, p.top + p.originY];
  const corners: Point[] = [[p.left, p.top], [p.left + p.width, p.top], [p.left, p.top + p.height], [p.left + p.width, p.top + p.height]];
  return Math.max(...corners.map((c) => turn(c, pivot, p.angle)[0]));
};

export { turn, nearSideOf, placed, rightmost };
