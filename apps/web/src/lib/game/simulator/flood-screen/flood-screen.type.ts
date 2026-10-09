/* @layer bridge-wasm @kind types */
import type { ConnectionInfo, FloodFillResult } from '@shared/game/navigation';

interface ScreenFlood {
  reachableCount: number;
  totalTiles: number;
  ledgeCount: number;
  entranceCount: number;
  edgeCount: number;
  intraCount: number;
  connections: ConnectionInfo[];
  edgeRows?: Array<{ row: number; raw: string; reached: string }>;
  sprites?: Array<{ type: string; row: number; col: number; reached: boolean }>;
}

interface ScreenFloodRun {
  result: FloodFillResult;
  connections: ConnectionInfo[];
}

export type { ScreenFlood, ScreenFloodRun };
