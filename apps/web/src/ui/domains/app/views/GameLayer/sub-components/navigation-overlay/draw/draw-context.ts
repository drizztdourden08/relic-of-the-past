/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import { overworldOrigin, roomOrigin, screenOriginFor } from '@app/lib/game/flood';
import { viewOrigin } from '@app/lib/game/bridge/view-origin';

/** Shared drawing context passed to all draw functions. */
interface DrawContext {
  ctx: CanvasRenderingContext2D;
  scaleX: number;
  scaleY: number;
  viewLeft: number;
  viewTop: number;
  snesW: number;
  snesH: number;
  TILE_PX: number;
  dotRadius: number;
  screenWorldX: number;
  screenWorldY: number;
  width: number;
  height: number;
  getScreenWorldOrigin: (screenIndex: number) => { x: number; y: number };
}

interface ViewportInfo {
  cameraX: number;
  cameraY: number;
  snesWidth: number;
  snesHeight: number;
  extraLeftRight: number;
  extraTopBottom: number;
  cameraLockShiftX: number;
  cameraLockShiftY: number;
  linkX: number;
  linkY: number;
  isGameplay: boolean;
}

const buildDrawContext = (ctx: CanvasRenderingContext2D, vp: ViewportInfo, width: number, height: number, result: FloodFillResult, isIndoors: boolean): DrawContext => {
  const camX = vp.cameraX;
  const camY = vp.cameraY;
  const snesW = vp.snesWidth;
  const snesH = vp.snesHeight;
  // Where the core started drawing: the camera, less the lock shift and the pixels the view adds on the
  // left and on top. Shared with every other overlay so they cannot drift apart again.
  const { viewLeft, viewTop } = viewOrigin(vp);
  const scaleX = width / snesW;
  const scaleY = height / snesH;

  const { x: screenWorldX, y: screenWorldY } = screenOriginFor({
    isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: result.screenIndex,
  });

  const TILE_PX = 8;
  const dotRadius = Math.max(2.5, 4 * Math.min(scaleX, scaleY));

  // Indoors, the occupied room uses the live-derived origin; any OTHER room in the batch has no
  // live position and falls back to roomOrigin(screenIndex) (see room-entrances.ts). Non-primary
  // rooms used to draw at the primary room's origin, a full room-width off.
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
