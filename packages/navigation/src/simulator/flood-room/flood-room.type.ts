/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, FloodFillResult, OverworldEntrance } from '@rotp/game-core';

interface RoomFloodRun {
  result: FloodFillResult;
  connections: ConnectionInfo[];
  entrances: OverworldEntrance[];
}

export type { RoomFloodRun };
