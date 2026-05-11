// Public API — re-exports from all game modules

export type { EmscriptenFS, EmscriptenModule, GameStatus, GameState } from './types';
export { getGameState, getModule, subscribeGameState } from './wasm-bridge';
export { getProfileId as getActiveProfileId } from './wasm-bridge';
export { startGame, resetGame } from './lifecycle';
export { saveState, loadState } from './save-states';
export { setItemOverride, clearItemOverrides } from './randomizer';
export { pushLiveSettings, requiresRestart, LIVE_SETTINGS } from './live-settings';
export { initMasterVolume, setMasterVolume } from './audio-volume';
export { getFps } from './fps';
