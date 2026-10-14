/* @layer renderer-components @kind logic */
import type { DrawContext } from './draw.type';

const isVerticalSpanOffscreen = (dc: DrawContext, y1: number, y2: number): boolean => {
  const { snesH, TILE_PX } = dc;
  return (y1 > snesH + TILE_PX && y2 > snesH + TILE_PX) || (y1 < -TILE_PX && y2 < -TILE_PX);
};

export { isVerticalSpanOffscreen };
