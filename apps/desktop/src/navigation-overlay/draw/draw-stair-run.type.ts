/* @layer renderer-components @kind types */
import type { FloodFillResult } from '@rotp/game-core';
import type { DrawContext, ScreenOrigin } from './draw.type';

interface StairRunInput {
  dc: DrawContext;
  drawResult: FloodFillResult;
  origin: ScreenOrigin;
  visited: Set<string>;
  r: number;
  c: number;
}

export type { StairRunInput };
