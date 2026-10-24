/* @layer renderer-components @kind logic */
import type { Point } from '../PadOverlay.type';

const pointSegmentDistance = (point: Point, a: Point, b: Point): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  const t = length === 0 ? 0 : Math.min(Math.max(((point.x - a.x) * dx + (point.y - a.y) * dy) / length, 0), 1);
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
};

export { pointSegmentDistance };
