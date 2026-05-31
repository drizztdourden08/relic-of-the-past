// Public API — re-exports from all game modules

export type { EmscriptenFS, EmscriptenModule, GameStatus, GameState } from './types';
export { getGameState, getModule, subscribeGameState } from './wasm-bridge';
export { getProfileId as getActiveProfileId } from './wasm-bridge';
export { wasmSetPaused, wasmTogglePause, wasmReset, wasmCheat, wasmGetViewportInfo, wasmRenderCleanFrame, wasmGetMenuState, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetIndoorUncleBlockers, wasmGetNavigationBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns, wasmBuildOverworldAttrGrid, wasmBuildRoomAttrGrid, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetAreaHeads, wasmGetEntranceRooms, wasmGetEntranceSpawns, wasmGetRoomLayoutInfo, wasmGetRoomDoorBoundaryTiles, wasmGetRoomStairInfo, wasmGetRoomTravelDestinations, wasmGetGameUIState } from './wasm-bridge';
export type { DoorBoundaryTile, FallHole, LiveSpriteInfo, OverworldVariantInfo, RoomLayoutInfo, RoomStairInfo, ViewportInfo } from './wasm-bridge';
export { startGame, resetGame } from './lifecycle';
export { setMsuData, setAutoSaveConfig } from './lifecycle';
export type { MsuTrackData, AutoSaveConfig } from './lifecycle';
export { saveState, loadState } from './save-states';
export { setItemOverride, clearItemOverrides } from './randomizer';
export { pushLiveSettings, reassertBackdropBlack, reassertHudHidden, reassertPauseHidden, reassertVolumes, requiresRestart, primeLiveSettings, LIVE_SETTINGS } from './live-settings';
export { initMasterVolume, setMasterVolume, suspendAudio, resumeAudio } from './audio-volume';
export { getFps } from './fps';
export {
  cheatGiveItem, cheatTriggerCheck, cheatTriggerNpcCheck,
  cheatSetHealth, cheatSetMaxHealth, cheatSetRupees, cheatSetBombs, cheatSetArrows, cheatRefillMagic,
  cheatFillBottle, cheatKillAllEnemies, cheatSetDamageMultiplier, cheatSetExtraArmorPct,
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
