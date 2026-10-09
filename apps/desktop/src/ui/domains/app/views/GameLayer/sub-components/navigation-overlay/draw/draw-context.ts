/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import { overworldOrigin, roomOrigin, screenOriginFor } from '@app/lib/game/flood';
import { viewOrigin } from '@app/lib/game/bridge/view-origin';
import { MIN_DOT_RADIUS, TILE_PX } from './draw.constants';
import type { DrawContext, ViewportInfo } from './draw.type';

const buildDrawContext = (ctx: CanvasRenderingContext2D, vp: ViewportInfo, width: number, height: number, result: FloodFillResult, isIndoors: boolean): DrawContext => {
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
export type { DrawContext, ViewportInfo };
