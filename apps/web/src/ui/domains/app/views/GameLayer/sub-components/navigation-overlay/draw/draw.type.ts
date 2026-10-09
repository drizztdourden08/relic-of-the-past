/* @layer renderer-components @kind types */
interface ScreenOrigin {
  x: number;
  y: number;
}

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
  getScreenWorldOrigin: (screenIndex: number) => ScreenOrigin;
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

interface LiveSprite {
  x: number;
  y: number;
  type: number;
  state: number;
  subtype: number;
  subtype2: number;
  slot: number;
  e: number;
}

interface LockedPathTile {
  row: number;
  col: number;
  attr: number;
}

export type { DrawContext, LiveSprite, LockedPathTile, ScreenOrigin, ViewportInfo };
