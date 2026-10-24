/* @layer renderer-components @kind logic */
import { PATH_NUMBER } from './slot-anchors.constants';
import type { Bounds, PlacedPart } from '../PadOverlay.type';

const contentBounds = (outline: string, parts: readonly PlacedPart[]): Bounds => {
  const values = (outline.match(PATH_NUMBER) ?? []).map(Number);
  const xs = values.filter((_, index) => index % 2 === 0);
  const ys = values.filter((_, index) => index % 2 === 1);
  parts.forEach((part) => {
    xs.push(part.x - part.radius, part.x + part.radius);
    ys.push(part.y - part.radius, part.y + part.radius);
  });
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { x: left, y: top, w: Math.max(Math.max(...xs) - left, 1), h: Math.max(Math.max(...ys) - top, 1) };
};

export { contentBounds };
