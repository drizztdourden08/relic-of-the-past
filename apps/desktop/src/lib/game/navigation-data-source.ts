/**
 * NavigationDataSource — Facade wrapping all WASM game state queries
 * used by the navigation system.
 *
 * Provides a single access point for flood-fill data preparation,
 * making dependencies explicit and enabling test mocking.
 */

import {
  wasmGetViewportInfo,
  wasmGetOverworldVariant,
  wasmGetProgressIndicator,
  wasmGetIndoorDualLayerGrids,
  wasmGetIndoorLayer0Grid,
  wasmGetLinkLayer,
  wasmGetRoomCollisionType,
  wasmGetStaircaseType,
  wasmGetIndoorUncleBlockers,
  wasmGetLiveSprites,
  wasmGetOverworldGuardSpawns,
  wasmBuildOverworldAttrGrid,
  wasmGetOverworldEntrances,
  wasmGetFallHoles,
  wasmGetExitScreenMap,
  wasmGetAreaHeads,
  wasmGetEntranceRooms,
  wasmGetEntranceSpawns,
  wasmGetRoomLayoutInfo,
  wasmGetRoomDoorBoundaryTiles,
  wasmGetRoomExitDoors,
  wasmGetRoomStairInfo,
  wasmGetRoomWalkBoundaries,
} from '../game';
import type { OverworldVariantInfo } from '../game';

export interface NavigationDataSource {
  // Viewport & positioning
  getViewportInfo(): ReturnType<typeof wasmGetViewportInfo>;
  getOverworldVariant(screenIndex: number): OverworldVariantInfo | null;
  getProgressIndicator(): ReturnType<typeof wasmGetProgressIndicator>;

  // Indoor layer data
  getIndoorDualLayerGrids(): ReturnType<typeof wasmGetIndoorDualLayerGrids>;
  getIndoorLayer0Grid(): ReturnType<typeof wasmGetIndoorLayer0Grid>;
  getLinkLayer(): number | null;
  getRoomCollisionType(): number | null;
  getStaircaseType(): number | null;

  // Dynamic blockers
  getIndoorUncleBlockers(): ReturnType<typeof wasmGetIndoorUncleBlockers>;
  getLiveSprites(): ReturnType<typeof wasmGetLiveSprites>;
  getOverworldGuardSpawns(): ReturnType<typeof wasmGetOverworldGuardSpawns>;

  // Grid building
  buildOverworldAttrGrid(screenIndex: number): ReturnType<typeof wasmBuildOverworldAttrGrid>;

  // Entrances & exits
  getOverworldEntrances(): ReturnType<typeof wasmGetOverworldEntrances>;
  getFallHoles(): ReturnType<typeof wasmGetFallHoles>;
  getExitScreenMap(): ReturnType<typeof wasmGetExitScreenMap>;
  getAreaHeads(): ReturnType<typeof wasmGetAreaHeads>;
  getEntranceRooms(): ReturnType<typeof wasmGetEntranceRooms>;
  getEntranceSpawns(): ReturnType<typeof wasmGetEntranceSpawns>;

  // Room structure
  getRoomLayoutInfo(): ReturnType<typeof wasmGetRoomLayoutInfo>;
  getRoomDoorBoundaryTiles(): ReturnType<typeof wasmGetRoomDoorBoundaryTiles>;
  getRoomExitDoors(): ReturnType<typeof wasmGetRoomExitDoors>;
  getRoomStairInfo(): ReturnType<typeof wasmGetRoomStairInfo>;
  getRoomWalkBoundaries(): ReturnType<typeof wasmGetRoomWalkBoundaries>;
}

/**
 * Live implementation backed by actual WASM bridge calls.
 */
export const liveDataSource: NavigationDataSource = {
  getViewportInfo: () => wasmGetViewportInfo?.() ?? null,
  getOverworldVariant: (screenIndex) => wasmGetOverworldVariant(screenIndex),
  getProgressIndicator: () => wasmGetProgressIndicator(),
  getIndoorDualLayerGrids: () => wasmGetIndoorDualLayerGrids(),
  getIndoorLayer0Grid: () => wasmGetIndoorLayer0Grid(),
  getLinkLayer: () => wasmGetLinkLayer?.() ?? null,
  getRoomCollisionType: () => wasmGetRoomCollisionType?.() ?? null,
  getStaircaseType: () => wasmGetStaircaseType?.() ?? null,
  getIndoorUncleBlockers: () => wasmGetIndoorUncleBlockers(),
  getLiveSprites: () => wasmGetLiveSprites(),
  getOverworldGuardSpawns: () => wasmGetOverworldGuardSpawns(),
  buildOverworldAttrGrid: (screenIndex) => wasmBuildOverworldAttrGrid(screenIndex),
  getOverworldEntrances: () => wasmGetOverworldEntrances(),
  getFallHoles: () => wasmGetFallHoles(),
  getExitScreenMap: () => wasmGetExitScreenMap(),
  getAreaHeads: () => wasmGetAreaHeads(),
  getEntranceRooms: () => wasmGetEntranceRooms(),
  getEntranceSpawns: () => wasmGetEntranceSpawns(),
  getRoomLayoutInfo: () => wasmGetRoomLayoutInfo(),
  getRoomDoorBoundaryTiles: () => wasmGetRoomDoorBoundaryTiles(),
  getRoomExitDoors: () => wasmGetRoomExitDoors(),
  getRoomStairInfo: () => wasmGetRoomStairInfo(),
  getRoomWalkBoundaries: () => wasmGetRoomWalkBoundaries(),
};
