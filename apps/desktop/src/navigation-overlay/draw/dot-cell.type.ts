/* @layer renderer-components @kind types */
import type { FloodFillResult, ReachState } from '@rotp/game-core';
import type { DrawContext, ScreenOrigin } from './draw.type';

type PerLayerReach = [ReachState[][], ReachState[][]];

interface DotCellState {
  layer0State: ReachState | undefined;
  layer1State: ReachState | undefined;
  layer0Reach: boolean;
  layer1Reach: boolean;
  mergedReachable: boolean;
  reachedOnBothLayers: boolean;
}

interface DotCellInput {
  dc: DrawContext;
  drawResult: FloodFillResult;
  origin: ScreenOrigin;
  perLayer: PerLayerReach | null;
  singleLayerIsAbove: boolean;
  row: number;
  col: number;
}

export type { DotCellInput, DotCellState, PerLayerReach };
