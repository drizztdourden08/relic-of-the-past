import type { FloodFillResult } from '@shared/game/navigation';
import type { ReachState } from '@shared/game/navigation/types';

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
  linkX: number;
  linkY: number;
  isGameplay: boolean;
}

function buildDrawContext(
  ctx: CanvasRenderingContext2D,
  vp: ViewportInfo,
  width: number,
  height: number,
  result: FloodFillResult,
  isIndoors: boolean,
): DrawContext {
  const camX = vp.cameraX;
  const camY = vp.cameraY;
  const snesW = vp.snesWidth;
  const snesH = vp.snesHeight;
  const viewLeft = camX - vp.extraLeftRight;
  const viewTop = camY;
  const scaleX = width / snesW;
  const scaleY = height / snesH;

  const screenWorldX = isIndoors
    ? (Math.floor(vp.linkX / 512) * 512)
    : ((result.screenIndex & 7) * 512);
  const screenWorldY = isIndoors
    ? (Math.floor(vp.linkY / 512) * 512)
    : (((result.screenIndex >> 3) & 7) * 512);

  const TILE_PX = 8;
  const dotRadius = Math.max(2.5, 4 * Math.min(scaleX, scaleY));

  const getScreenWorldOrigin = (screenIndex: number) => {
    if (isIndoors) {
      return { x: screenWorldX, y: screenWorldY };
    }
    return {
      x: (screenIndex & 7) * 512,
      y: ((screenIndex >> 3) & 7) * 512,
    };
  };

  return {
    ctx, scaleX, scaleY, viewLeft, viewTop, snesW, snesH,
    TILE_PX, dotRadius, screenWorldX, screenWorldY, width, height,
    getScreenWorldOrigin,
  };
}

export { buildDrawContext };
export type { DrawContext, ViewportInfo };
