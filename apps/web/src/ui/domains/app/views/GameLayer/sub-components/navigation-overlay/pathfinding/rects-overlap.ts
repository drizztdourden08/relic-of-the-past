/* @layer renderer-components @kind logic */
import type { Rect } from '../navigation-overlay.type';

const rectsOverlap = (a: Rect, b: Rect): boolean => {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
};

export { rectsOverlap };
