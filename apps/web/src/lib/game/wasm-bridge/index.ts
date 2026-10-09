/* @layer bridge-wasm @kind barrel */
export { getGameState } from './get-game-state';
export { getModule } from './get-module';
export { getProfileId } from './get-profile-id';
export { setInput } from './set-input';
export { setModule } from './set-module';
export { setProfileId } from './set-profile-id';
export { setState } from './set-state';
export { subscribeGameState } from './subscribe-game-state';
export { UI_STATE_BUFFER_SIZE } from './wasm-bridge.constants';

export { wasmGetPlayerStateInfo } from '../bridge/player-state';
export type { PlayerStateInfo } from '../bridge/player-state';

export { wasmSetPaused } from '../bridge/commands';
export {
  wasmHostMenuClose, wasmHostMenuIsHolding, wasmHostMenuSaveAndQuit, wasmHostMenuSetTakeover,
  wasmHostSetActiveItem, wasmHostSetGear,
} from '../bridge/host-menu';
export { wasmGetViewportInfo, wasmRenderCleanFrame } from '../bridge/render';
export { wasmGetGameUIState, wasmSetUIOverlayMode, wasmGetUIOverlayMode, wasmGetMenuState } from '../bridge/ui-state';
export {
  wasmGetDialogState, wasmSetDialogPacing, wasmSetDialogHidden, wasmGetDialogFont, wasmGetDialogPalette,
  wasmDialogMarkStale,
} from '../bridge/dialog';
export {
  wasmGetTitleFrame, wasmGetTitleHidden, wasmGetTitlePalette, wasmGetTitlePoly, wasmSetTitleHidden,
} from '../bridge/title';
export { wasmGetProgressIndicator, wasmGetOverworldVariant } from '../bridge/progress';
export {
  wasmGetIndoorDualLayerGrids, wasmBuildRoomDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer,
  wasmGetRoomCollisionType, wasmGetStaircaseType, wasmBuildOverworldAttrGrid,
  wasmBuildRoomAttrGrid, wasmGetToggleFloorPositions,
  wasmGetReplacementTileState, wasmGetChestLocations,
} from '../bridge/room-grids';
export { wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition, roomSectionSplitFrom } from '../bridge/room-layout';
export {
  wasmGetRoomDoorBoundaryTiles, wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries,
  wasmGetRoomWalkBoundariesFor, wasmGetRoomExitDoors, wasmGetRoomTravelDestinations,
  wasmGetRoomTravelDestinationsFor, wasmGetRoomTagsFor,
} from '../bridge/room-doors';
export {
  wasmGetIndoorUncleBlockers, wasmGetNavigationBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns,
} from '../bridge/sprites-blockers';
export {
  wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetAreaHeads, wasmGetEntranceRooms,
  wasmGetEntranceSpawns,
} from '../bridge/nav-tables';
export {
  wasmGetRoomChests, wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetRoomDoorInfo, wasmSimUnlockDoor,
  wasmSimCloseDoor, wasmSimKillDrop, wasmSimFollowerAttach, wasmSimFollowerRescue, wasmSimPushMantle,
  wasmSimMarkMapIcons, wasmGetReceiveCount, wasmGetReceiveSite, wasmGetRoomCellLocks, wasmSimOpenCellLock,
  wasmTriggerOverworldCheck, wasmReadFlagSnapshot,
} from '../bridge/sim-queries';
export { wasmGetSpriteCombat, wasmGetCombatTables } from '../bridge/combat-tables';
export { setSimulatorSupport } from '../bridge/host-gates';
export { isExtraDungeonAvailable, setExtraDungeonEnabled } from '../bridge/second-cartridge';

export type { ViewportInfo } from '../bridge/render';
export type { OverworldVariantInfo, GameProgressInfo } from '../bridge/progress';
export type { RoomLayoutInfo, DungeonMapPosition } from '../bridge/room-layout';
export type { DoorBoundaryTile, RoomStairInfo, RoomWalkBoundary, RoomExitDoor } from '../bridge/room-doors';
export type { LiveSpriteInfo } from '../bridge/sprites-blockers';
export type { OverworldEntrance, FallHole } from '../bridge/nav-tables';
export type { SimChestRaw, SimSpriteRaw, SimDoorRaw, SimDoorDirection, SimFlagSnapshot } from '../bridge/sim-queries';
export type { SpriteCombatInfo, CombatTables } from '../bridge/combat-tables';
