/* @layer renderer-components @kind logic */
import type { Point } from '../HookshopHighlight.type';
import { FAR } from './near-side-of.constants';

const unit = (a: Point, b: Point): Point => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
};

const nearSideOf = (a: Point, b: Point): Point[] => {
  const d = unit(a, b);
  const n: Point = [-d[1], d[0]];
  const top: Point = [a[0] - d[0] * FAR, a[1] - d[1] * FAR];
  const bottom: Point = [b[0] + d[0] * FAR, b[1] + d[1] * FAR];
  return [top, bottom, [bottom[0] + n[0] * FAR, bottom[1] + n[1] * FAR], [top[0] + n[0] * FAR, top[1] + n[1] * FAR]];
};

export { nearSideOf };
