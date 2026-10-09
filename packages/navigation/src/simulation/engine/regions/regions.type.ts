/* @layer shared-game @kind types */
import type { GridPos } from '@rotp/game-core';

interface RegionJob {
  from: string;
  to: string;
  edgeSig?: string;
}

type RegionReachMap = Map<string, boolean[][]>;

type CameFrom = { screenId: string; tile: GridPos } | null;

export type { RegionJob, RegionReachMap, CameFrom };
