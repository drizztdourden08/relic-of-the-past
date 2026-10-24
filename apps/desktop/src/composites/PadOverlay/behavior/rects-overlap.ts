/* @layer renderer-components @kind logic */
import type { Rect } from './placement.type';

const rectsOverlap = (a: Rect, b: Rect, pad: number): boolean =>
  a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;

export { rectsOverlap };
