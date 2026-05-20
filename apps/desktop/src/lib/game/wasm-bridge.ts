/**
 * WASM Bridge — singleton holding the Emscripten module reference and game state.
 * All other game modules import from here to access the running module.
 */

import type { EmscriptenModule, GameState } from './types';

type GameStateListener = (state: GameState) => void;

let currentModule: EmscriptenModule | null = null;
let currentState: GameState = { status: 'idle', error: null };
let currentProfileId: string | null = null;
const listeners = new Set<GameStateListener>();

function setState(next: GameState): void {
  currentState = next;
  for (const fn of listeners) {
    try { fn(next); } catch { /* ignore */ }
  }
}

function getGameState(): GameState {
  return currentState;
}

function getModule(): EmscriptenModule | null {
  return currentModule;
}

function setModule(mod: EmscriptenModule | null): void {
  currentModule = mod;
}

function getProfileId(): string | null {
  return currentProfileId;
}

function setProfileId(id: string | null): void {
  currentProfileId = id;
}

function subscribeGameState(fn: GameStateListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Push a SNES input bitmask to the running WASM module.
 * Called by InputManager each frame.
 */
function setInput(mask: number): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetInput', null, ['number'], [mask]);
}

// ─── Game commands (pause, reset, cheats) ───

/** Pause or unpause the game at the WASM/C level. */
function wasmSetPaused(paused: boolean): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetPaused', null, ['number'], [paused ? 1 : 0]);
}

/** Query whether the game is paused at the WASM/C level. */
function wasmGetPaused(): boolean {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return false;
  return mod.ccall('WasmGetPaused', 'number', [], []) !== 0;
}

/** Toggle game pause at the WASM/C level. */
function wasmTogglePause(): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmTogglePause', null, [], []);
}

/** Reset the game. warm=true preserves SRAM, warm=false is a cold reset. */
function wasmReset(warm: boolean): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmReset', null, ['number'], [warm ? 1 : 0]);
}

/** Execute a cheat command. 'w' = health, 'W' = equipment, 'o' = keys. */
function wasmCheat(cmd: string): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmCheat', null, ['number'], [cmd.charCodeAt(0)]);
}

/** Force the PPU backdrop color (CGRAM[0]) to black every frame. */
function wasmSetForceBackdropBlack(enabled: boolean): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetForceBackdropBlack', null, ['number'], [enabled ? 1 : 0]);
}

// ─── Viewport Info (for edge glow shader) ───

interface ViewportInfo {
  /** Game module: 7=dungeon, 9=overworld, 14=menu, 0/1=intro/title */
  mainModule: number;
  submodule: number;
  /** Max extra pixels per side allowed by config */
  extraLeftRight: number;
  /** Actual valid map content pixels on left beyond base 256 */
  extraLeftCur: number;
  /** Actual valid map content pixels on right beyond base 256 */
  extraRightCur: number;
  /** Actual valid map content pixels below base 224 */
  extraBottomCur: number;
  /** Total render width */
  snesWidth: number;
  /** Total render height */
  snesHeight: number;
  /** Pixels of black on the left edge (no map content) */
  blackLeft: number;
  /** Pixels of black on the right edge (no map content) */
  blackRight: number;
  /** Pixels of black on the bottom edge (no map content) */
  blackBottom: number;
  /** Whether the game is in active gameplay (dungeon or overworld) */
  isGameplay: boolean;
  /** Physical location module (unaffected by text/menu overlays) */
  locationModule: number;
  /** Location type: 0=overworld/other, 1=house/cave, 2=dungeon */
  locationType: number;
}

/**
 * Read viewport/game-state info from WASM for shader edge detection.
 * Returns null if the module isn't running or the export doesn't exist yet.
 */
function wasmGetViewportInfo(): ViewportInfo | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetViewportInfo', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const mainModule = heap[ptr];
    const submodule = heap[ptr + 1];
    const extraLeftRight = heap[ptr + 2];
    const extraLeftCur = heap[ptr + 3];
    const extraRightCur = heap[ptr + 4];
    const extraBottomCur = heap[ptr + 5];
    const snesWidth = heap[ptr + 6] | (heap[ptr + 7] << 8);
    const snesHeight = heap[ptr + 8] | (heap[ptr + 9] << 8);
    const locationModule = heap[ptr + 10];
    const locationType = heap[ptr + 11]; // 0=overworld, 1=house/cave, 2=dungeon

    // Black pixels = max extra - actual rendered extra
    const blackLeft = extraLeftRight - extraLeftCur;
    const blackRight = extraLeftRight - extraRightCur;
    // Bottom: extend_y adds 16 rows (240-224), extraBottomCur = how many have content
    const blackBottom = snesHeight === 240 ? (16 - extraBottomCur) : 0;

    // Active gameplay = location module 7 (dungeon) or 9 (overworld)
    const isGameplay = (locationModule === 7 || locationModule === 9);

    return {
      mainModule, submodule, extraLeftRight, extraLeftCur, extraRightCur,
      extraBottomCur, snesWidth, snesHeight, blackLeft, blackRight, blackBottom,
      isGameplay, locationModule, locationType,
    };
  } catch {
    return null;
  }
}

/**
 * Render a clean frame (no HUD/BG3) into WASM memory and return the pixel data.
 * Returns null if the module isn't running or the export doesn't exist.
 */
function wasmRenderCleanFrame(): { data: Uint8Array; width: number; height: number } | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmRenderCleanFrame', 'number', [], []) as number;
    if (!ptr) return null;
    const width = mod.ccall('WasmGetCleanFrameWidth', 'number', [], []) as number;
    const height = mod.ccall('WasmGetCleanFrameHeight', 'number', [], []) as number;
    if (!width || !height) return null;
    const byteLength = width * height * 4;
    const data = mod.HEAPU8.subarray(ptr, ptr + byteLength);
    return { data, width, height };
  } catch {
    return null;
  }
}

// ─── Game UI State (for React overlay) ───

/** Size of the UI state buffer exported from C */
const UI_STATE_BUFFER_SIZE = 109;

/**
 * Read the raw game UI state buffer from WASM.
 * Returns the HEAP pointer and HEAPU8 reference, or null if unavailable.
 */
function wasmGetGameUIState(): { heap: Uint8Array; ptr: number } | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetGameUIState', 'number', [], []) as number;
    if (!ptr) return null;
    return { heap: mod.HEAPU8, ptr };
  } catch {
    return null;
  }
}

/** Set the UI overlay mode bitmask (controls native rendering suppression). */
function wasmSetUIOverlayMode(mode: number): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetUIOverlayMode', null, ['number'], [mode]);
}

/** Get the current UI overlay mode bitmask. */
function wasmGetUIOverlayMode(): number {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return 0;
  return mod.ccall('WasmGetUIOverlayMode', 'number', [], []) as number;
}

/**
 * Get in-game menu state: 0=gameplay, 1=opening, 2=open, 3=closing.
 * Used to sync enhanced HUD overlay transitions with the native pause animation.
 */
function wasmGetMenuState(): number {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return 0;
  try {
    return mod.ccall('WasmGetMenuState', 'number', [], []) as number;
  } catch {
    return 0;
  }
}

export {
  getGameState,
  getModule,
  getProfileId,
  setInput,
  setModule,
  setProfileId,
  setState,
  subscribeGameState,
  UI_STATE_BUFFER_SIZE,
  wasmCheat,
  wasmGetGameUIState,
  wasmGetMenuState,
  wasmGetPaused,
  wasmGetUIOverlayMode,
  wasmGetViewportInfo,
  wasmRenderCleanFrame,
  wasmReset,
  wasmSetForceBackdropBlack,
  wasmSetPaused,
  wasmSetUIOverlayMode,
  wasmTogglePause
};
export type { ViewportInfo };
