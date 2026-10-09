/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, FloodFillResult } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import type { EdgeName } from '../simulator/exit-order';

interface CrossingFilterScope {
  isIndoors: boolean;
  roomIndex: number;
  connections: readonly ConnectionInfo[];
  flood?: FloodFillResult;
  items?: readonly TileReq[];
}

interface BlockedSpot {
  edge: EdgeName;
  pos: number;
}

export type { CrossingFilterScope, BlockedSpot };
