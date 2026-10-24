/* @layer renderer-components @kind logic */
import type { Circle, Rect } from './placement.type';

const rectHitsCircle = (rect: Rect, circle: Circle): boolean => {
  const x = Math.min(Math.max(circle.x, rect.left), rect.right);
  const y = Math.min(Math.max(circle.y, rect.top), rect.bottom);
  return Math.hypot(circle.x - x, circle.y - y) < circle.r;
};

export { rectHitsCircle };
