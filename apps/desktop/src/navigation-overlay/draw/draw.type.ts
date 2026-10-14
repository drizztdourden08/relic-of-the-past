/* @layer renderer-components @kind types */
import type { FloodFillResult } from '@rotp/game-core';
import type { MouseState } from '../navigation-overlay.type';

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

interface DrawContextParams {
  ctx: CanvasRenderingContext2D;
  vp: ViewportInfo;
  width: number;
  height: number;
  result: FloodFillResult;
  isIndoors: boolean;
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

interface PathPreviewInput {
  mouseState: MouseState;
  result: FloodFillResult;
  vp: { linkX: number; linkY: number };
  setLockedPath: (path: LockedPathTile[] | null) => void;
}

export type { DrawContext, DrawContextParams, LiveSprite, LockedPathTile, PathPreviewInput, ScreenOrigin, ViewportInfo };
