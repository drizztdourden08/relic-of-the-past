/* @layer shared-game @kind types */
import type { RegionNavData } from '../nav-data.types';
import type { FloodFillResult } from '../types';

type ScreenTileStats = Pick<RegionNavData, 'totalTiles' | 'freeTileCount' | 'maxReachableTileCount'>;

interface GlobalFloodOptions {
  getGrid: (screenIndex: number) => number[][];
  indoors: boolean;
  screenIndices: number[];
}

interface GlobalFloodResult {
  screens: Map<number, ScreenTileStats>;
  floodResults: Map<number, FloodFillResult>;
}

export type { GlobalFloodOptions, GlobalFloodResult, ScreenTileStats };
