/* @layer renderer-components @kind logic */
import { overworldOrigin, roomOrigin, screenOriginFor } from '@app/game/flood';
import { viewOrigin } from '@rotp/game-core';
import { MIN_DOT_RADIUS, TILE_PX } from './draw.constants';
import type { DrawContext, DrawContextParams } from './draw.type';

const buildDrawContext = (params: DrawContextParams): DrawContext => {
  const { ctx, vp, width, height, result, isIndoors } = params;
  const snesW = vp.snesWidth;
  const snesH = vp.snesHeight;
  const { viewLeft, viewTop } = viewOrigin(vp);
  const scaleX = width / snesW;
  const scaleY = height / snesH;

  const { x: screenWorldX, y: screenWorldY } = screenOriginFor({
    isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: result.screenIndex,
  });

  const dotRadius = Math.max(MIN_DOT_RADIUS, 4 * Math.min(scaleX, scaleY));

  const getScreenWorldOrigin = (screenIndex: number) => {
    if (isIndoors) {
      return screenIndex === result.screenIndex ? { x: screenWorldX, y: screenWorldY } : roomOrigin(screenIndex);
    }
    return overworldOrigin(screenIndex);
  };

  return {
    ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH,
    TILE_PX, dotRadius, screenWorldX, screenWorldY, width, height,
    getScreenWorldOrigin,
  };
};

export { buildDrawContext };
