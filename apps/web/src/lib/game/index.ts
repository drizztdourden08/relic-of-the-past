/* @layer bridge-wasm @kind logic */
// Public API, re-exporting from all game modules

export type { EmscriptenFS, EmscriptenModule, GameStatus, GameState } from './types';
export { getGameState, getModule, subscribeGameState } from './wasm-bridge';
export { getProfileId as getActiveProfileId } from './wasm-bridge';
export { wasmSetPaused, wasmGetViewportInfo, wasmRenderCleanFrame, wasmGetMenuState, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorDualLayerGrids, wasmBuildRoomDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetRoomCollisionType, wasmGetStaircaseType, wasmGetIndoorUncleBlockers, wasmGetNavigationBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns, wasmBuildOverworldAttrGrid, wasmBuildRoomAttrGrid, wasmGetToggleFloorPositions, wasmGetReplacementTileState, wasmGetChestLocations, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetAreaHeads, wasmGetEntranceRooms, wasmGetEntranceSpawns, wasmGetRoomLayoutInfo, roomSectionSplitFrom, wasmGetDungeonMapPosition, wasmGetRoomDoorBoundaryTiles, wasmGetRoomExitDoors, wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries, wasmGetRoomWalkBoundariesFor, wasmGetRoomTravelDestinations, wasmGetRoomTravelDestinationsFor, wasmGetRoomTagsFor, wasmGetGameUIState, wasmGetRoomChests, wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetRoomDoorInfo, wasmSimUnlockDoor, wasmSimCloseDoor, wasmSimKillDrop, wasmSimFollowerAttach, wasmSimFollowerRescue, wasmSimPushMantle, wasmSimMarkMapIcons, wasmGetReceiveCount, wasmGetReceiveSite, wasmGetRoomCellLocks, wasmSimOpenCellLock, wasmTriggerOverworldCheck, wasmReadFlagSnapshot, wasmGetPlayerStateInfo, wasmGetSpriteCombat, wasmGetCombatTables, setSimulatorSupport } from './wasm-bridge';
export type { PlayerStateInfo } from './wasm-bridge';
export type { DoorBoundaryTile, DungeonMapPosition, FallHole, LiveSpriteInfo, OverworldVariantInfo, RoomExitDoor, RoomLayoutInfo, RoomStairInfo, RoomWalkBoundary, ViewportInfo } from './wasm-bridge';
export type { SimChestRaw, SimSpriteRaw, SimDoorRaw, SimDoorDirection, SimFlagSnapshot } from './wasm-bridge';
export type { SpriteCombatInfo, CombatTables } from './wasm-bridge';
export { startGame, resetGame } from './lifecycle';
export { setAutoSaveConfig, setLinkSpriteData } from './lifecycle';
export { applyPlayerSprite, clearPlayerSprite } from './player-sprite';
export type { AutoSaveConfig } from './lifecycle';
export { saveState, loadState, loadNamedState, loadStateRef, captureStateBuffer, loadStateFromBuffer } from './save-states';
export { captureGameFrameBlob, fulfillFrameCapture } from './capture-frame';
export { setChestSlotOverride, clearItemOverrides } from './randomizer';
export { pushLiveSettings, reassertBackdropBlack, reassertVsync, reassertHudHidden, reassertPauseHidden, reassertVolumes, reassertLiveFlagsAfterLoad, reassertFeatureFlags, primeLiveSettings, LIVE_SETTINGS } from './live-settings';
export { initMasterVolume, setMasterVolume, suspendAudio, resumeAudio } from './audio-volume';
export { getFps } from './fps';
export {
  cheatGiveItem, cheatTriggerCheck, cheatTriggerNpcCheck,
  cheatSetHealth, cheatSetMaxHealth, cheatSetRupees, cheatSetBombs, cheatSetArrows,
  cheatSetMaxBombs, cheatSetMaxArrows, cheatSetMaxWallet, cheatSetMagic, cheatRefillMagic,
  cheatFillBottle, cheatSetIgnoreCollision, getIgnoreCollisionEnabled,
  cheatSetIlluminateDarkRooms, getIlluminateDarkRoomsEnabled,
  cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct,
  cheatStartTrace,
  BottleContents,
} from './cheats';
export type { BottleContentsValue } from './cheats';
export { getInputManager, resolveFunctionMappingIcon } from '../input/input-manager';
export type { UnknownItemEntry } from './tracker';
export {
  initTrackerBridge, destroyTrackerBridge,
  onItemReceived, onInventoryChanged, onUnknownItem, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks, getUnknownItems, loadUnknownItems,
  pollInventoryState, pollRoomFlags,
} from './tracker';
export { deliveryQueue } from './delivery-queue';
export type { DeliveryEntry, DeliveryAction, DeliveryQueueState } from './delivery-queue';
export { deliverItem, deliverCheck, deliverNpcCheck, deliverCustom } from './delivery-api';
export { armNextReceiptMessage, grantCapacityUpgrade } from './receipt-grants';
export type { TransitionKind, TransitionSettled, TransitionListener } from './events';
export { subscribeTransitionSettled } from './events';
