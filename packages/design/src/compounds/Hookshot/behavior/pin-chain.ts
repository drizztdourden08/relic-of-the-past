/* @layer renderer-components @kind logic */
import type { HookshotCurve, Point } from '../Hookshot.type';
import { SAMPLES, SEARCH_STEPS } from './pin-chain.constants';
import type { Cursor } from './pin-chain.type';
import { pointAt } from './point-at';

const bezierAt = (curve: HookshotCurve, t: number): Point => {
  const [p0, p1, p2, p3] = curve;
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};

const distance = (a: Point, b: Point): number => Math.hypot(b[0] - a[0], b[1] - a[1]);
const between = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const nextPin = (line: Point[], from: Cursor, step: number): Cursor | null => {
  for (let i = from.segment; i < line.length - 1; i++) {
    const end = pointAt(line, i + 1);
    if (distance(from.point, end) < step) continue;
    const start = i === from.segment ? from.point : pointAt(line, i);
    let lo = 0, hi = 1;
    for (let k = 0; k < SEARCH_STEPS; k++) {
      const mid = (lo + hi) / 2;
      if (distance(from.point, between(start, end, mid)) < step) lo = mid;
      else hi = mid;
    }
    return { point: between(start, end, hi), segment: i };
  }
  return null;
};

const walk = (line: Point[], step: number, count: number): Point[] | null => {
  const first = pointAt(line, 0);
  const pins: Point[] = [first];
  let cursor: Cursor | null = { point: first, segment: 0 };
  for (let i = 0; i < count && cursor; i++) {
    cursor = nextPin(line, cursor, step);
    if (cursor) pins.push(cursor.point);
  }
  return cursor ? pins : null;
};

const pinChain = (curve: HookshotCurve, pitch: number): Point[] => {
  const line = Array.from({ length: SAMPLES + 1 }, (_, i) => bezierAt(curve, i / SAMPLES));
  const length = line.slice(1).reduce((sum, p, i) => sum + distance(pointAt(line, i), p), 0);
  const count = Math.max(1, Math.round(length / pitch));
  let lo = pitch * 0.5, hi = pitch * 1.5;
  for (let k = 0; k < SEARCH_STEPS; k++) {
    const mid = (lo + hi) / 2;
    if (walk(line, mid, count)) lo = mid;
    else hi = mid;
  }
  const pins = walk(line, lo, count) ?? [pointAt(line, 0)];
  pins[pins.length - 1] = pointAt(line, line.length - 1);
  return pins;
};

export { pinChain };
