/* @layer bridge-wasm @kind logic */
export type { EmscriptenFS, EmscriptenModule, GameStatus, GameState, PlayerStateInfo, DoorBoundaryTile, DungeonMapPosition, FallHole, LiveSpriteInfo, OverworldVariantInfo, RoomExitDoor, RoomLayoutInfo, RoomStairInfo, RoomWalkBoundary, ViewportInfo, SimChestRaw, SimSpriteRaw, SimDoorRaw, SimDoorDirection, SimFlagSnapshot, SpriteCombatInfo, CombatTables, BottleContentsValue, CapacityKind, CapacityRung, CheatCategory, DungeonItemKind, TransitionKind, TransitionSettled, TransitionListener } from '@rotp/game-core';
export { getGameState, getModule, subscribeGameState, getProfileId as getActiveProfileId, wasmSetPaused, wasmGetViewportInfo, wasmRenderCleanFrame, wasmGetMenuState, wasmGetOverworldVariant, wasmGetProgressIndicator, wasmGetIndoorDualLayerGrids, wasmBuildRoomDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer, wasmGetRoomCollisionType, wasmGetStaircaseType, wasmGetIndoorUncleBlockers, wasmGetNavigationBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns, wasmBuildOverworldAttrGrid, wasmBuildRoomAttrGrid, wasmGetToggleFloorPositions, wasmGetReplacementTileState, wasmGetChestLocations, wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetAreaHeads, wasmGetEntranceRooms, wasmGetEntranceSpawns, wasmGetRoomLayoutInfo, roomSectionSplitFrom, wasmGetDungeonMapPosition, wasmGetRoomDoorBoundaryTiles, wasmGetRoomExitDoors, wasmGetRoomStairInfo, wasmGetRoomStairInfoFor, wasmGetRoomWalkBoundaries, wasmGetRoomWalkBoundariesFor, wasmGetRoomTravelDestinations, wasmGetRoomTravelDestinationsFor, wasmGetRoomTagsFor, wasmGetGameUIState, wasmGetRoomChests, wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetRoomDoorInfo, wasmSimUnlockDoor, wasmSimCloseDoor, wasmSimKillDrop, wasmSimFollowerAttach, wasmSimFollowerRescue, wasmSimPushMantle, wasmSimMarkMapIcons, wasmGetReceiveCount, wasmGetReceiveSite, wasmGetRoomCellLocks, wasmSimOpenCellLock, wasmTriggerOverworldCheck, wasmReadFlagSnapshot, wasmGetPlayerStateInfo, wasmGetSpriteCombat, wasmGetCombatTables, setSimulatorSupport, markStateLoaded, wasStateJustLoaded, isCoreReady, whenCoreReady, captureGameFrameBlob, fulfillFrameCapture, initMasterVolume, setMasterVolume, suspendAudio, resumeAudio, getFps, cheatSetHealth, cheatSetMaxHealth, cheatSetRupees, cheatSetBombs, cheatSetArrows, cheatSetMaxBombs, cheatSetMaxArrows, cheatSetMaxWallet, cheatSetMagic, cheatRefillMagic, cheatSetBottle, cheatSetInventorySlot, cheatSetSmallKeys, cheatSetDungeonItem, CheatSlot, cheatCapacityLadder, cheatCapacityRung, cheatSetCapacityRung, cheatCategoryAllowed, cheatSetIgnoreCollision, getIgnoreCollisionEnabled, cheatUnblockLink, cheatSetIlluminateDarkRooms, getIlluminateDarkRoomsEnabled, cheatKillAllEnemies, cheatSetDamageMultiplier, getDamageMultiplier, cheatSetExtraArmorPct, getExtraArmorPct, cheatStartTrace, BottleContents, closeHostMenu, initHostMenu, reassertActiveItem, reassertAfterSaveLoad, reassertHostMenu, reconcileHostMenu, saveAndQuitHostMenu, setActiveItem, setGear, setTakeover, wantedActiveItem, subscribeTransitionSettled } from '@rotp/game-core';
export { startGame, resetGame, setAutoSaveConfig, setLinkSpriteData } from './lifecycle';
export { applyPlayerSprite, clearPlayerSprite } from './player-sprite';
export type { AutoSaveConfig } from './lifecycle';
export { saveState, loadState, loadNamedState, loadStateRef } from './save-states';
export { captureStateBuffer, loadStateFromBuffer } from './state-buffers';
export { setChestSlotOverride, clearItemOverrides } from './randomizer';
export { pushLiveSettings, reassertHideSpaceBeyondWalls, reassertVsync, reassertHudHidden, reassertPauseHidden, reassertVolumes, reassertLiveFlagsAfterLoad, reassertFeatureFlags, primeLiveSettings, LIVE_SETTINGS } from './live-settings';
export { cheatGiveItem, cheatTriggerCheck, cheatTriggerNpcCheck } from '@rotp/randomizer';
export { grantFromCheck, planCheckGrant } from './cheat-check-grant';
export type { CheckGrantPlan } from './cheat-check-grant';
export { initGearOwnership, observeGear, ownedMax } from './gear-ownership';
export type { GearTiers } from './gear-ownership';
export { getInputManager } from '@app/input/input-manager/get-input-manager';
export { resolveFunctionMappingIcon } from '@rotp/input-mapping';
export type { UnknownItemEntry } from './tracker';
export {
  initTrackerBridge, destroyTrackerBridge,
  onItemReceived, onInventoryChanged, onUnknownItem, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks, getEventStatus, getUnknownItems, loadUnknownItems, onEventStatusChanged,
  pollInventoryState, pollRoomFlags,
} from './tracker';
export { deliveryQueue } from './delivery-queue';
export type { DeliveryEntry, DeliveryAction, DeliveryQueueState } from './delivery-queue';
export { deliverItem, deliverCheck, deliverNpcCheck, deliverCustom } from './delivery-api';
export { armNextReceiptMessage, grantCapacityUpgrade } from './receipt-grants';
