/* @layer renderer-components @kind logic */
import type { DrawContext, ScreenOrigin } from './draw.type';

const isSegmentOffscreen = (dc: DrawContext, a: ScreenOrigin, b: ScreenOrigin): boolean => {
  const { snesW, snesH, TILE_PX } = dc;
  return (a.x < -TILE_PX && b.x < -TILE_PX)
    || (a.x > snesW + TILE_PX && b.x > snesW + TILE_PX)
    || (a.y < -TILE_PX && b.y < -TILE_PX)
    || (a.y > snesH + TILE_PX && b.y > snesH + TILE_PX);
};

export { isSegmentOffscreen };
