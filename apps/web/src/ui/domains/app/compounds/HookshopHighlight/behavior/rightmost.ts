/* @layer renderer-components @kind logic */
import type { PlacedPart, Point } from '../HookshopHighlight.type';
import { turn } from './turn';

const rightmost = (p: PlacedPart): number => {
  const pivot: Point = [p.left + p.originX, p.top + p.originY];
  const corners: Point[] = [[p.left, p.top], [p.left + p.width, p.top], [p.left, p.top + p.height], [p.left + p.width, p.top + p.height]];
  return Math.max(...corners.map((c) => turn(c, pivot, p.angle)[0]));
};

export { rightmost };
