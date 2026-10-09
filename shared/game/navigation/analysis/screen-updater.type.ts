/* @layer shared-game @kind types */
import type { RegionNavData } from '@rotp/game-data';
import type { FloodFillResult } from '../types';
import type { ScreenDefinition } from '@rotp/game-data';
import type { ResolvedEntrance } from './entrance-resolver.type';

interface ScreenNavUpdate {
  screenId: string;
  screenIndex: number;
  nav: RegionNavData;
}

interface ScreenUpdaterInput {
  regions: ScreenDefinition[];
  tileStats: Map<number, { totalTiles: number; freeTileCount: number; maxReachableTileCount: number }>;
  floodResults: Map<number, FloodFillResult>;
  resolvedEntrances: ResolvedEntrance[];
}

export type { ScreenNavUpdate, ScreenUpdaterInput };
