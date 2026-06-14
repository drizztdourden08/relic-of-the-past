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
