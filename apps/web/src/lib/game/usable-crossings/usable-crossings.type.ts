/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, FloodFillResult } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
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
