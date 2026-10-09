/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, FloodFillResult, GridPos, OverworldEntrance } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import type { EdgeName } from '../crossing-landing.type';

interface ScreenFloodRequest {
  items: TileReq[];
  startPos?: GridPos;
  extraSeeds?: GridPos[];
  atPlayer?: boolean;
  entrances: OverworldEntrance[];
  intraEdges?: EdgeName[];
}

interface ScreenFloodResult {
  screenIndex: number;
  result: FloodFillResult;
  connections: ConnectionInfo[];
}

interface AreaFloodRequest extends ScreenFloodRequest {
  isIndoors: boolean;
  primaryScreenIndex: number;
}

export type { ScreenFloodRequest, ScreenFloodResult, AreaFloodRequest };
