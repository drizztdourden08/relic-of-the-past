/* @layer shared-game @kind logic */
/**
 * Flood-fill orchestrator — dispatches to the dual- or single-layer run path.
 * Screen prep, run paths, helpers, and connection derivation live in sibling modules.
 */
import type { FloodFillResult } from '../types';
import { runDualLayerFlood, runSingleLayerFlood } from './flood-paths';
import type { FloodFillOptions } from './flood-options';

const floodFillScreen = (rawAttrGrid: number[][], screenIndex: number, options: FloodFillOptions): FloodFillResult => {
  const isIndoors = options.indoors;
  // staircaseType 2 = layer changes blocked. Force single-layer BFS on the starting layer only.
  const layerBlocked = options.staircaseType === 2;
  const useDualLayer = isIndoors && !!options.dualLayerGrids && !layerBlocked;

  return useDualLayer
    ? runDualLayerFlood(rawAttrGrid, screenIndex, options)
    : runSingleLayerFlood(rawAttrGrid, screenIndex, options, layerBlocked);
};

export { floodFillScreen };
export { getConnections } from './connections';
export type { FloodFillOptions } from './flood-options';
