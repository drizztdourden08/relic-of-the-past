/* @layer shared-game @kind logic */
import type { TileReq } from '../tile-attrs';
import type { FloodFillResult } from '../types';
import type { GlobalFloodOptions, GlobalFloodResult, ScreenTileStats } from './global-flood.type';
import { floodFillScreen } from '../flood-fill/orchestrator';
import { INVENTORY_PROGRESSION } from './analysis.constants';

const runGlobalFlood = (options: GlobalFloodOptions): GlobalFloodResult => {
  const { getGrid, indoors, screenIndices } = options;
  const screens = new Map<number, ScreenTileStats>();
  const floodResults = new Map<number, FloodFillResult>();

  const emptyInventory = new Set<TileReq>();
  const fullInventory = new Set<TileReq>(
    INVENTORY_PROGRESSION[INVENTORY_PROGRESSION.length - 1] as TileReq[],
  );

  for (const screenIndex of screenIndices) {
    let grid: number[][];
    try {
      grid = getGrid(screenIndex);
    } catch {
      continue;
    }

    const freeResult = floodFillScreen(grid, screenIndex, { indoors, inventory: emptyInventory });
    floodResults.set(screenIndex, freeResult);
    const fullResult = floodFillScreen(grid, screenIndex, { indoors, inventory: fullInventory });

    screens.set(screenIndex, {
      totalTiles: freeResult.totalTiles,
      freeTileCount: freeResult.reachableCount,
      maxReachableTileCount: fullResult.reachableCount,
    });
  }

  return { screens, floodResults };
};

export { runGlobalFlood };
export type { GlobalFloodOptions, GlobalFloodResult } from './global-flood.type';
