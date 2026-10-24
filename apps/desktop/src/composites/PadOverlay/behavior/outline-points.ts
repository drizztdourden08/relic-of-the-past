/* @layer renderer-components @kind logic */
import { CURVE_STEPS } from '../PadOverlay.constants';
import type { Point } from '../PadOverlay.type';
import { PATH_NUMBER } from './slot-anchors.constants';

const cubicAt = (curve: readonly number[], from: Point, t: number): Point => {
  const u = 1 - t;
  const [x1 = 0, y1 = 0, x2 = 0, y2 = 0, x = 0, y = 0] = curve;
  return {
    x: u * u * u * from.x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
    y: u * u * u * from.y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
  };
};

const outlinePoints = (outline: string): Point[] => {
  const [startX = 0, startY = 0, ...rest] = (outline.match(PATH_NUMBER) ?? []).map(Number);
  const points: Point[] = [{ x: startX, y: startY }];
  for (let index = 0; index + 5 < rest.length; index += 6) {
    const curve = rest.slice(index, index + 6);
    const from = points.at(-1) ?? { x: startX, y: startY };
    for (let step = 1; step <= CURVE_STEPS; step += 1) points.push(cubicAt(curve, from, step / CURVE_STEPS));
  }
  return points;
};

export { outlinePoints };
