/* @layer renderer-components @kind types */
import type { FloodFillResult } from '@rotp/game-core';
import type { ViewportInfo, wasmGetLiveSprites } from '@app/game';
import type { GridPos } from '../navigation-overlay.type';

type Sprites = ReturnType<typeof wasmGetLiveSprites>;

interface SpriteInfoParams {
  sprites: Sprites;
  tileRow: number;
  tileCol: number;
  screenWorldX: number;
  screenWorldY: number;
}

interface PathTipParams {
  activeTarget: GridPos;
  vp: ViewportInfo;
  screenWorldX: number;
  screenWorldY: number;
  viewLeft: number;
  viewTop: number;
  scaleX: number;
  scaleY: number;
  mx: number;
  my: number;
  width: number;
  height: number;
  result: FloodFillResult;
  lockTarget: boolean;
}

interface TooltipPosition {
  tipX: number;
  tipY: number;
}

interface PassEquipment {
  gloves: number;
  boots: unknown;
  flippers: unknown;
}

export type { PassEquipment, PathTipParams, SpriteInfoParams, Sprites, TooltipPosition };
