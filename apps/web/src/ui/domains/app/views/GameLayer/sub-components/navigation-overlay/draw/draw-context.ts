/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';
import { overworldOrigin, roomOrigin, screenOriginFor } from '@app/lib/game/flood';

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
  // The wide/tall camera lock shifts the rendered view by cameraLockShift (rendered view = camera − shift),
  // so the canvas origin is the game camera minus the lock shift minus the side budget. Subtract it or
  // world-anchored overlay elements drift and appear to follow the player as the view re-centers.
  const viewLeft = camX - vp.cameraLockShiftX - vp.extraLeftRight;
  const viewTop = camY - vp.cameraLockShiftY;
  const scaleX = width / snesW;
  const scaleY = height / snesH;

  const { x: screenWorldX, y: screenWorldY } = screenOriginFor({
    isIndoors, linkX: vp.linkX, linkY: vp.linkY, screenIndex: result.screenIndex,
  });

  const TILE_PX = 8;
  const dotRadius = Math.max(2.5, 4 * Math.min(scaleX, scaleY));

  // Indoors, the room the player physically occupies uses the live-derived origin
  // (screenWorldX/Y above); any OTHER room drawn in the same batch — a connected
  // room the multi-room flood also covers — has no live position to derive from,
  // so it falls back to its own roomOrigin(screenIndex). The two agree for the
  // primary room (roomOrigin is exactly how the entrance/stair tile math built its
  // own coordinates — see room-entrances.ts), so this only changes behavior for
  // non-primary rooms, which previously always drew at the primary room's origin
  // and landed every one of their markers a full room-width off.
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
