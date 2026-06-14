/* @layer bridge-wasm @kind logic */
/**
 * WASM Bridge — the singleton core holding the Emscripten module reference and
 * game state, plus a re-export hub for the per-concern bridge facades (bridge/*).
 * All other game modules import from here to reach the running module.
 *
 * The bridge/* modules import getModule/getGameState from here and only call them
 * at runtime, so the re-export cycle below is safe.
 */

import type { EmscriptenModule, GameState } from './types';

type GameStateListener = (state: GameState) => void;

let currentModule: EmscriptenModule | null = null;
let currentState: GameState = { status: 'idle', error: null };
let currentProfileId: string | null = null;
const listeners = new Set<GameStateListener>();

/** Size of the UI state buffer exported from C. */
const UI_STATE_BUFFER_SIZE = 109;

const setState = (next: GameState): void => {
  currentState = next;
  for (const fn of listeners) {
    try { fn(next); } catch { /* ignore */ }
  }
};

const getGameState = (): GameState => currentState;
const getModule = (): EmscriptenModule | null => currentModule;
const setModule = (mod: EmscriptenModule | null): void => { currentModule = mod; };
const getProfileId = (): string | null => currentProfileId;
const setProfileId = (id: string | null): void => { currentProfileId = id; };

const subscribeGameState = (fn: GameStateListener): () => void => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** Push a SNES input bitmask to the running WASM module. Called by InputManager each frame.
 *  Kept self-contained (no import from bridge/wasm-call) so wasm-bridge has no static edge
 *  into wasm-call — that completed a bidirectional cycle which, combined with lifecycle's
 *  dynamic import of this module, could be evaluated as a second instance under Vite dev,
 *  desyncing the startGame re-entry guard (see lib/game/lifecycle.ts). */
const setInput = (mask: number): void => {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetInput', null, ['number'], [mask]);
};

// ─── Re-export the per-concern bridge facades (external API unchanged) ───
export { wasmSetPaused } from './bridge/commands';
export { wasmGetViewportInfo, wasmRenderCleanFrame } from './bridge/render';
export { wasmGetGameUIState, wasmSetUIOverlayMode, wasmGetUIOverlayMode, wasmGetMenuState } from './bridge/ui-state';
export { wasmGetProgressIndicator, wasmGetOverworldVariant } from './bridge/progress';
export {
  wasmGetIndoorDualLayerGrids, wasmGetIndoorLayer0Grid, wasmGetLinkLayer,
  wasmGetRoomCollisionType, wasmGetStaircaseType, wasmBuildOverworldAttrGrid,
  wasmBuildRoomAttrGrid, wasmGetToggleFloorPositions,
} from './bridge/room-grids';
export { wasmGetRoomLayoutInfo, wasmGetDungeonMapPosition } from './bridge/room-layout';
export {
  wasmGetRoomDoorBoundaryTiles, wasmGetRoomStairInfo, wasmGetRoomWalkBoundaries,
  wasmGetRoomExitDoors, wasmGetRoomTravelDestinations,
} from './bridge/room-doors';
export { wasmGetIndoorUncleBlockers, wasmGetNavigationBlockers, wasmGetLiveSprites, wasmGetOverworldGuardSpawns } from './bridge/sprites-blockers';
export { wasmGetOverworldEntrances, wasmGetFallHoles, wasmGetExitScreenMap, wasmGetAreaHeads, wasmGetEntranceRooms, wasmGetEntranceSpawns } from './bridge/nav-tables';

export type { ViewportInfo } from './bridge/render';
export type { OverworldVariantInfo, GameProgressInfo } from './bridge/progress';
export type { RoomLayoutInfo, DungeonMapPosition } from './bridge/room-layout';
export type { DoorBoundaryTile, RoomStairInfo, RoomWalkBoundary, RoomExitDoor } from './bridge/room-doors';
export type { LiveSpriteInfo } from './bridge/sprites-blockers';
export type { OverworldEntrance, FallHole } from './bridge/nav-tables';

export {
  getGameState, getModule, getProfileId, setInput, setModule, setProfileId,
  setState, subscribeGameState, UI_STATE_BUFFER_SIZE,
};
