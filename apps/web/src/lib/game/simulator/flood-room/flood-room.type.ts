/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, FloodFillResult, OverworldEntrance } from '@shared/game/navigation';

interface RoomFloodRun {
  result: FloodFillResult;
  connections: ConnectionInfo[];
  entrances: OverworldEntrance[];
}

export type { RoomFloodRun };
