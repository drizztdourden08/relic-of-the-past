/* @layer shared-game @kind types */
import type { GridPos } from '@rotp/game-core';

interface RegionJob {
  from: string;
  to: string;
  edgeSig?: string;
}

type RegionReachMap = Map<string, boolean[][]>;

interface RegionProgress {
  visited: Set<string>;
  arrivals: Set<string>;
  crossings?: Set<string>;
}

type CameFrom = { screenId: string; tile: GridPos } | null;

export type { RegionJob, RegionProgress, RegionReachMap, CameFrom };
