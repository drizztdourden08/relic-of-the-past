/* @layer renderer-widgets @kind types */
import type { ConnectionInfo, FloodFillResult, ScreenCrossing } from '@shared/game/navigation';
import type { TileReq } from '@shared/game/navigation/tile-attrs';
import type { enrichEntrances } from '@app/lib/game/flood/overworld-entrances';
import type { wasmGetRoomLayoutInfo, wasmGetViewportInfo } from '../../../../../lib/game';

type EdgeName = 'north' | 'south' | 'east' | 'west';

type Cell = { row: number; col: number };

type Entrance = ReturnType<typeof enrichEntrances>[number];

type FallHoleLanding = { gridRow: number; gridCol: number; entranceId: number };

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

interface EdgeRow {
  crossing: ScreenCrossing;
  sourceScreen: number;
}

export type {
  AnnotateArgs, Cell, CollectArgs, CrossingsArgs, EdgeName, EdgeRow, Entrance, FallHoleLanding, IndoorBundleArgs, InventoryEquipment,
  PropagateCtx, ScreenResponse, StartContext, StartContextArgs,
};
