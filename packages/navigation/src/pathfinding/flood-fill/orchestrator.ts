/* @layer shared-game @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import type { FloodFillOptions } from './flood-options';
import { runDualLayerFlood } from './run-dual-layer-flood';
import { runSingleLayerFlood } from './run-single-layer-flood';
import { LAYER_LOCKED_STAIRCASE } from './flood-fill.constants';

const floodFillScreen = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions): FloodFillResult => {
  const layerBlocked = options.staircaseType === LAYER_LOCKED_STAIRCASE;
  const { dualLayerGrids } = options;

  if (options.indoors && dualLayerGrids && !layerBlocked) return runDualLayerFlood(screenIndex, options, dualLayerGrids);
  return runSingleLayerFlood(rawAttrGrid, screenIndex, options, layerBlocked);
};

export { floodFillScreen };
export type { FloodFillOptions } from './flood-options';
