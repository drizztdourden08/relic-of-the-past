/* @layer renderer-components @kind logic */
import type { Rect } from '@rotp/hud';

const scaledRect = (rect: Rect, displayScale: number): Rect => ({
  x: rect.x * displayScale,
  y: rect.y * displayScale,
  w: rect.w * displayScale,
  h: rect.h * displayScale,
});

export { scaledRect };
