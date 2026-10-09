/* @layer bridge-wasm @kind types */
type RoomShape = '2x2' | '2x1' | '1x2' | '1x1';

type RoomEdge = 'north' | 'south' | 'east' | 'west';

interface RoomLayoutInfo {
  layout: number;
  shape: RoomShape;
  quadrantFullsizeX: number;
  quadrantFullsizeY: number;
  quadrantX: number;
  quadrantY: number;
  intraEdges: RoomEdge[];
}

interface DungeonMapPosition {
  mapCol: number;
  mapRow: number;
  floorRaw: number;
  floorLabel: string;
  numAboveFloors: number;
  numBasementFloors: number;
  found: boolean;
  effectiveWidth: number;
  effectiveHeight: number;
  effectiveLayout: string;
}

export type { RoomShape, RoomEdge, RoomLayoutInfo, DungeonMapPosition };
