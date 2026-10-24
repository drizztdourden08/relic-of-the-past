/* @layer renderer-components @kind logic */
import type { Point } from '../PadOverlay.type';
import type { Rect, Segment } from './placement.type';
import { segmentsCross } from './segments-cross';

const inside = (rect: Rect, x: number, y: number): boolean => x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;

const apart = (a: Point, b: Point, rect: Rect): boolean =>
  (a.x <= rect.left && b.x <= rect.left) || (a.x >= rect.right && b.x >= rect.right)
  || (a.y <= rect.top && b.y <= rect.top) || (a.y >= rect.bottom && b.y >= rect.bottom);

const segmentHitsRect = ([a, b]: Segment, rect: Rect): boolean => {
  if (apart(a, b, rect)) return false;
  if (inside(rect, a.x, a.y) || inside(rect, b.x, b.y)) return true;
  const corners = [
    { x: rect.left, y: rect.top }, { x: rect.right, y: rect.top }, { x: rect.right, y: rect.bottom }, { x: rect.left, y: rect.bottom },
  ];
  return corners.some((corner, index) => segmentsCross(a, b, corner, corners[(index + 1) % corners.length] ?? corner));
};

export { segmentHitsRect };
