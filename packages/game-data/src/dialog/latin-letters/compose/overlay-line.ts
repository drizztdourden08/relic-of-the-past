/* @layer shared-game @kind logic */
import type { Point } from './compose.type';

const line = (x0: number, y0: number, x1: number, y1: number): Point[] => {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    points.push([Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t)]);
  }
  return points;
};

export { line };
