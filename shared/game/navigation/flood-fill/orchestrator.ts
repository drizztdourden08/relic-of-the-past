/* @layer shared-game @kind logic */
import type { FloodFillResult } from '../types';
import type { FloodFillOptions } from './flood-options';
import { runDualLayerFlood } from './run-dual-layer-flood';
import { runSingleLayerFlood } from './run-single-layer-flood';
import { LAYER_LOCKED_STAIRCASE } from './flood-fill.constants';

const floodFillScreen = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions): FloodFillResult => {
  const layerBlocked = options.staircaseType === LAYER_LOCKED_STAIRCASE;
  const useDualLayer = options.indoors && !!options.dualLayerGrids && !layerBlocked;

  return useDualLayer
    ? runDualLayerFlood(screenIndex, options)
    : runSingleLayerFlood(rawAttrGrid, screenIndex, options, layerBlocked);
};

export { floodFillScreen };
export type { FloodFillOptions } from './flood-options';
