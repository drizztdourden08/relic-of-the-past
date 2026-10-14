/* @layer renderer-components @kind logic */
import type { DrawContext } from './draw.type';

const isOffscreen = (dc: DrawContext, screenX: number, screenY: number): boolean => {
  const { snesW, snesH, TILE_PX } = dc;
  return screenX < -TILE_PX || screenX > snesW + TILE_PX || screenY < -TILE_PX || screenY > snesH + TILE_PX;
};

export { isOffscreen };
