/* @layer renderer-appshell @kind types */
import type { FloodFillResult, ConnectionInfo, GridPos } from '@rotp/game-core';
import type { ScreenAnnotations, floodRoomRun } from '@rotp/navigation';
import type { TileReq } from '@rotp/game-data';

interface MatchingEntrance {
  id: number;
  spawnX: number;
  spawnY: number;
  gridRow: number;
  gridCol: number;
  isFallHole: boolean;
  isOverworldDoor: boolean;
  classification: string;
}

interface FallHoleLanding {
  entranceId: number;
  gridRow: number;
  gridCol: number;
  fromArea: number;
  fromAreaHex: string;
}

interface StairInfo {
  index: number;
  destRoom: number;
  row: number;
  col: number;
  destRoomHex: string;
}

interface TravelDest {
  index: number;
  room: number;
  roomHex: string;
  label: string;
}

interface FloodFillDump {
  reachableCount: number;
  totalTiles: number;
  reachableRows: string[];
  reachableByLayer?: { layer0: string[]; layer1: string[] };
  ledges: Array<{ startRow: number; startCol: number; endRow: number; endCol: number }>;
  attrRows: { layer0: string[]; layer1: string[] | null };
  connections: unknown[];
  scrollBoundary: unknown;
}

type Spawn = { x: number; y: number } | undefined;
type EdgeName = 'north' | 'south' | 'east' | 'west';

interface EntranceDataInput {
  roomIndex: number;
  entranceRooms: ArrayLike<number> | null;
  entranceSpawns: Spawn[] | null;
  fallHoles: Array<{ entranceId: number; area: number }>;
  owEntrances: Array<{ id: number }>;
}

type FloodRun = { result: FloodFillResult; connections: ConnectionInfo[] };

interface FloodFillDumpInput {
  roomIndex: number;
  run: FloodRun | null;
  attrGrid: Uint8Array | null;
  dualLayerGrids: { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | null;
  playerLayer: 0 | 1 | null;
  staircaseType: number | null;
  startPos?: { row: number; col: number };
  roomLayout: {
    intraEdges?: EdgeName[];
    shape?: string;
    quadrantFullsizeX?: number;
    quadrantFullsizeY?: number;
  } | null;
}

interface RunFloodArgs {
  isIndoors: boolean;
  roomIndex: number;
  overworldScreenIndex: number;
  startPos?: GridPos;
  screenId: string | null;
  attrGrid: Uint8Array | null;
  dualLayerGrids: { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | null;
  playerLayer: 0 | 1 | null;
  staircaseType: number | null;
  roomLayout: { intraEdges?: Array<'north' | 'south' | 'east' | 'west'>; shape?: string; quadrantFullsizeX?: number; quadrantFullsizeY?: number } | null;
}

interface AreaTotalsParams {
  args: RunFloodArgs;
  items: TileReq[];
  roomRun: ReturnType<typeof floodRoomRun> | null;
}

interface RunFloodResult {
  floodFill: FloodFillDump | null;
  annotations: ScreenAnnotations | null;
}

export type {
  AreaTotalsParams,

  EntranceDataInput,
  FallHoleLanding,
  FloodFillDump,
  FloodFillDumpInput,
  FloodRun,
  MatchingEntrance,
  RunFloodArgs,
  RunFloodResult,

  StairInfo,
  TravelDest,
};
