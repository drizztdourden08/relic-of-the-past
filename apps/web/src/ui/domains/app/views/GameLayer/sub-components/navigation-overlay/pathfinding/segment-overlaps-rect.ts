/* @layer renderer-components @kind logic */
import type { Rect } from '../navigation-overlay.type';
import { AXIS_EPSILON } from './pathfinding.constants';
import type { PlanePoint } from './pathfinding.type';

const segmentOverlapsRect = (a: PlanePoint, b: PlanePoint, rect: Rect, margin: number): boolean => {
  const minX = rect.x - margin;
  const maxX = rect.x + rect.w + margin;
  const minY = rect.y - margin;
  const maxY = rect.y + rect.h + margin;

  if (Math.abs(a.y - b.y) < AXIS_EPSILON) {
    const y = a.y;
    if (y < minY || y > maxY) return false;
    const sx1 = Math.min(a.x, b.x);
    const sx2 = Math.max(a.x, b.x);
    return sx2 >= minX && sx1 <= maxX;
  }

  if (Math.abs(a.x - b.x) < AXIS_EPSILON) {
    const x = a.x;
    if (x < minX || x > maxX) return false;
    const sy1 = Math.min(a.y, b.y);
    const sy2 = Math.max(a.y, b.y);
    return sy2 >= minY && sy1 <= maxY;
  }

  return false;
};

export { segmentOverlapsRect };
