/* @layer renderer-components @kind types */
import type { FloodFillResult, ReachState } from '@rotp/game-core';
import type { TooltipLayers } from './tooltip/tooltip.type';

interface BuildTooltipLayersParams {
  result: FloodFillResult;
  row: number;
  col: number;
  roomIndex: number;
  isIndoors: boolean;
  rawPalaceIndexX2: number;
  reachableByLayer?: [ReachState[][], ReachState[][]];
  equipment: { gloves: number; boots: unknown; flippers: unknown };
  inventoryItems: ArrayLike<number>;
}

interface TooltipLayersBuild {
  roomTypeLabel: string;
  layers: TooltipLayers;
}

export type { BuildTooltipLayersParams, TooltipLayersBuild };
