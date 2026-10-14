/* @layer renderer-widgets @kind types */
import type { ConnectionInfo, FloodFillResult, ScreenCrossing } from '@rotp/game-core';
import type { TileReq } from '@rotp/game-data';
import type { enrichEntrances } from '@rotp/navigation';
import type { wasmGetRoomLayoutInfo, wasmGetViewportInfo } from '../../game';

type EdgeName = 'north' | 'south' | 'east' | 'west';

type Cell = { row: number; col: number };

type Entrance = ReturnType<typeof enrichEntrances>[number];

type FallHoleLanding = { gridRow: number; gridCol: number; entranceId: number };

type RoomShape = NonNullable<ReturnType<typeof wasmGetRoomLayoutInfo>>['shape'];

type GridSize = { cols: number; rows: number };

type EffectiveLayout = { width: number; height: number };

interface AnnotateArgs {
  fillResults: FloodFillResult[];
  isIndoors: boolean;
  primaryScreenIndex: number;
  primaryScreenId: string | null;
}

interface ScreenResponse {
  screenIndex: number;
  result: FloodFillResult;
  connections: ConnectionInfo[];
  dynamicBlockers: Cell[] | undefined;
}

interface CrossingsArgs {
  isIndoors: boolean;
  responses: readonly ScreenResponse[];
  items: readonly TileReq[];
}

interface IndoorBundleArgs {
  screenName: string;
  primaryScreenIndex: number;
  allConnections: ConnectionInfo[];
  roomLayout: ReturnType<typeof wasmGetRoomLayoutInfo>;
  intraEdges: EdgeName[];
}

interface CollectArgs {
  primaryScreenIndex: number;
  allEntrances: Entrance[];
  exitScreenByRoom: Map<number, number>;
  fallHoleEntIds: Set<number>;
  overworldDoorEntIds: Set<number>;
}

interface StartContext {
  startPos: Cell | undefined;
}

interface StartContextArgs {
  vp: ReturnType<typeof wasmGetViewportInfo>;
  primaryScreenIndex: number;
  isIndoors: boolean;
}

interface InventoryEquipment {
  gloves: number;
  boots: unknown;
  flippers: unknown;
}

interface PropagateCtx {
  isIndoors: boolean;
  primaryScreenIndex: number;
  startPos: Cell | undefined;
  items: string[];
  allEntrances: Entrance[];
  intraEdges: EdgeName[];
}

interface PrepareFloodArgs {
  isIndoors: boolean;
  activeScreenIndex: number;
  overworldScreenIndex: number;
  equipment: InventoryEquipment;
  inventoryItems: ArrayLike<number>;
}

interface FloodPrep {
  primaryScreenIndex: number;
  startPos: Cell | undefined;
  items: string[];
  allEntrances: Entrance[];
  currentRespawnIds: Set<number>;
  roomLayout: ReturnType<typeof wasmGetRoomLayoutInfo>;
  intraEdges: EdgeName[];
}

interface FloodSummary {
  fillResults: FloodFillResult[];
  primaryResult: FloodFillResult;
  allConnections: ConnectionInfo[];
  dynamicBlockerCount: number;
}

interface EdgeRow {
  crossing: ScreenCrossing;
  sourceScreen: number;
}

export type {
  AnnotateArgs, Cell, CollectArgs, CrossingsArgs, EdgeName, EdgeRow, EffectiveLayout, Entrance, FallHoleLanding, FloodPrep, FloodSummary, GridSize,
  IndoorBundleArgs, InventoryEquipment, PrepareFloodArgs, PropagateCtx, RoomShape, ScreenResponse, StartContext, StartContextArgs,
};
