/* @layer renderer-components @kind types */
import type { FloodFillResult } from '@rotp/game-core';
import type { DrawContext, ScreenOrigin } from './draw.type';

interface PitCellInput {
  dc: DrawContext;
  drawResult: FloodFillResult;
  origin: ScreenOrigin;
  r: number;
  c: number;
  stripeSize: number;
}

export type { PitCellInput };
