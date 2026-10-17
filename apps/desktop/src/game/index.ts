/* @layer bridge-wasm @kind logic */
export type { GameStatus, OverworldVariantInfo, RoomLayoutInfo, RoomStairInfo, ViewportInfo, BottleContentsValue, CapacityKind, CapacityRung, CheatCategory, DungeonItemKind } from '@rotp/game-core';
export { getGameState, getModule, subscribeGameState, getProfileId as getActiveProfileId, wasmSetPaused, wasmGetViewportInfo, wasmRenderCleanFrame, wasmGetMenuState, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorDualLayerGrids, wasmBuildRoomDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetRoomCollisionType, wasmGetStaircaseType, wasmGetIndoorUncleBlockers, wasmGetNavigationBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns, wasmBuildOverworldAttrGrid, wasmBuildRoomAttrGrid, wasmGetToggleFloorPositions, wasmGetReplacementTileState, wasmGetChestLocations, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetAreaHeads, wasmGetEntranceRooms, wasmGetEntranceSpawns, wasmGetRoomLayoutInfo, roomSectionSplitFrom, wasmGetDungeonMapPosition, wasmGetRoomDoorBoundaryTiles, wasmGetRoomExitDoors, wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries, wasmGetRoomWalkBoundariesFor, wasmGetRoomTravelDestinations, wasmGetRoomTravelDestinationsFor, wasmGetRoomTagsFor, wasmGetGameUIState, wasmGetRoomChests, wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetRoomDoorInfo, wasmSimUnlockDoor, wasmSimCloseDoor, wasmSimKillDrop, wasmSimFollowerAttach, wasmSimFollowerRescue, wasmSimPushMantle, wasmSimMarkMapIcons, wasmGetReceiveCount, wasmGetReceiveSite, wasmGetRoomCellLocks, wasmSimOpenCellLock, wasmTriggerOverworldCheck, wasmReadFlagSnapshot, wasmGetPlayerStateInfo, wasmGetSpriteCombat, wasmGetCombatTables, setSimulatorSupport, isCoreReady, whenCoreReady, captureGameFrameBlob, fulfillFrameCapture, getFps, cheatSetHealth, cheatSetMaxHealth, cheatSetRupees, cheatSetBombs, cheatSetArrows, cheatSetMagic, cheatSetBottle, cheatSetInventorySlot, cheatSetSmallKeys, cheatSetDungeonItem, CheatSlot, cheatCapacityLadder, cheatCapacityRung, cheatSetCapacityRung, cheatCategoryAllowed, cheatSetIgnoreCollision, getIgnoreCollisionEnabled, cheatUnblockLink, cheatSetIlluminateDarkRooms, getIlluminateDarkRoomsEnabled, cheatKillAllEnemies, cheatSetDamageMultiplier, getDamageMultiplier, cheatSetExtraArmorPct, getExtraArmorPct, BottleContents, subscribeTransitionSettled } from '@rotp/game-core';
export { startGame, resetGame, setAutoSaveConfig, setLinkSpriteData } from './lifecycle';
export { applyPlayerSprite, clearPlayerSprite } from './player-sprite';
export { saveState, loadState, loadStateRef } from './save-states';
export { captureStateBuffer, loadStateFromBuffer } from './state-buffers';
export { pushLiveSettings, reassertFeatureFlags, primeLiveSettings, LIVE_SETTINGS } from './live-settings';
export { grantFromCheck, planCheckGrant } from './cheat-check-grant';
export type { CheckGrantPlan } from './cheat-check-grant';
export { getInputManager } from '@app/input/input-manager/get-input-manager';
export { resolveFunctionMappingIcon } from '@rotp/input-mapping';
export {
  onItemReceived,
  onInventoryChanged,
  onCompletedChecksChanged,
  getCurrentInventory,
  getCompletedChecks,
  getEventStatus,
  onEventStatusChanged,
} from './tracker';
export { deliveryQueue } from './delivery-queue';
export { deliverItem } from './delivery-api';
export { overworldScreenIdOf, OVERWORLD_MODULE } from './overworld-screen';
