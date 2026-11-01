/* @layer shared-hud @kind logic */
import { EMPTY_RECT } from './union-of.constants';
import type { Rect } from './geometry.type';

const unionOf = (rects: readonly Rect[]): Rect => {
  if (rects.length === 0) return { ...EMPTY_RECT };
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  };
};

export { unionOf };
