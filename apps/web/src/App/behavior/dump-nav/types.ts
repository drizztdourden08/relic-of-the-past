/* @layer renderer-appshell @kind types */

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
  /** 64 rows of 64 base-36 chars — one ReachState digit per tile (0 = unreachable). */
  reachableRows: string[];
  /** One-way ledge traversals produced by cliff preprocessing (start → landing). */
  ledges: Array<{ startRow: number; startCol: number; endRow: number; endCol: number }>;
  /** Raw attr grids as 64 rows of 2-char hex bytes; layer1 only for dual-layer rooms. */
  attrRows: { layer0: string[]; layer1: string[] | null };
  connections: unknown[];
  scrollBoundary: unknown;
}

export type {
  MatchingEntrance,
  FallHoleLanding,
  StairInfo,
  TravelDest,
  FloodFillDump,
};
