/* @layer renderer-components @kind logic */
import type { Point } from '../PadOverlay.type';

const turn = (a: Point, b: Point, c: Point): number => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));

const segmentsCross = (a: Point, b: Point, c: Point, d: Point): boolean =>
  turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0;

export { segmentsCross };
