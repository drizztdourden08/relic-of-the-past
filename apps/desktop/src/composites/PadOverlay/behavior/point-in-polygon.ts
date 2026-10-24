/* @layer renderer-components @kind logic */
import type { Point } from '../PadOverlay.type';

const pointInPolygon = (point: Point, polygon: readonly Point[]): boolean => {
  let inside = false;
  polygon.forEach((a, index) => {
    const b = polygon[(index + 1) % polygon.length] ?? a;
    if ((a.y > point.y) !== (b.y > point.y) && point.x < a.x + ((point.y - a.y) / (b.y - a.y)) * (b.x - a.x)) inside = !inside;
  });
  return inside;
};

export { pointInPolygon };
