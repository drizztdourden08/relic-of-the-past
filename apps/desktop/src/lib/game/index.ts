// Public API — re-exports from all game modules

export type { EmscriptenFS, EmscriptenModule, GameStatus, GameState } from './types';
export { getGameState, getModule, subscribeGameState } from './wasm-bridge';
export { getProfileId as getActiveProfileId } from './wasm-bridge';
export { wasmSetPaused, wasmTogglePause, wasmReset, wasmCheat, wasmGetViewportInfo, wasmRenderCleanFrame } from './wasm-bridge';
export type { ViewportInfo } from './wasm-bridge';
export { startGame, resetGame } from './lifecycle';
export { setMsuData } from './lifecycle';
export type { MsuTrackData } from './lifecycle';
export { saveState, loadState } from './save-states';
export { setItemOverride, clearItemOverrides } from './randomizer';
export { pushLiveSettings, requiresRestart, LIVE_SETTINGS } from './live-settings';
export { initMasterVolume, setMasterVolume, suspendAudio, resumeAudio } from './audio-volume';
export { getFps } from './fps';
export { getInputManager, resolveFunctionMappingIcon } from '../input/input-manager';
export type { UnknownItemEntry } from './tracker';
export {
  initTrackerBridge, destroyTrackerBridge,
  onItemReceived, onInventoryChanged, onUnknownItem, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks, getUnknownItems, loadUnknownItems,
  pollInventoryState, pollRoomFlags,
} from './tracker';
