/* @layer shared-game @kind logic */
/**
 * Global Flood Fill — Orchestrates BFS across all overworld screens.
 *
 * Runs the single-screen flood fill for every screen in the world,
 * collecting reachable tile counts per requirement set.
 *
 * Input: WASM attr grids (via getGrid callback)
 * Output: Per-screen RegionNavData.totalTiles / freeTileCount / maxReachableTileCount
 */

import type { RegionNavData } from '../nav-data.types';
import type { TileAttrContext } from '../tile-attrs';
import type { TileReq } from '../tile-attrs';
import type { FloodFillResult } from '../types';
import { floodFillScreen } from '../flood-fill/orchestrator';
import { INVENTORY_PROGRESSION } from './requirement-detector';

interface GlobalFloodOptions {
  getGrid: (screenIndex: number) => number[][];
  tileContext: TileAttrContext;
  screenIndices: number[];
}

interface GlobalFloodResult {
  screens: Map<number, Pick<RegionNavData, 'totalTiles' | 'freeTileCount' | 'maxReachableTileCount'>>;
  /** Full flood results per screen (no-inventory run), for downstream analysis */
  floodResults: Map<number, FloodFillResult>;
}

const runGlobalFlood = (options: GlobalFloodOptions): GlobalFloodResult => {
  const { getGrid, tileContext, screenIndices } = options;
  const screens = new Map<number, Pick<RegionNavData, 'totalTiles' | 'freeTileCount' | 'maxReachableTileCount'>>();
  const floodResults = new Map<number, FloodFillResult>();

  const emptyInventory = new Set<TileReq>();
  const fullInventory = new Set<TileReq>(
    INVENTORY_PROGRESSION[INVENTORY_PROGRESSION.length - 1] as TileReq[]
  );

  for (const screenIndex of screenIndices) {
    let grid: number[][];
    try {
      grid = getGrid(screenIndex);
    } catch {
      continue;
    }

    // BFS with no items — free tile count
    const freeResult = floodFillScreen(grid, screenIndex, {
      tileContext,
      inventory: emptyInventory,
    });
    floodResults.set(screenIndex, freeResult);

    // BFS with all items — max reachable count
    const fullResult = floodFillScreen(grid, screenIndex, {
      tileContext,
      inventory: fullInventory,
    });

    screens.set(screenIndex, {
      totalTiles: freeResult.totalTiles,
      freeTileCount: freeResult.reachableCount,
      maxReachableTileCount: fullResult.reachableCount,
    });
  }

  return { screens, floodResults };
};

export { runGlobalFlood };
export type { GlobalFloodOptions, GlobalFloodResult };
