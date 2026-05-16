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

export function setState(next: GameState): void {
  currentState = next;
  for (const fn of listeners) {
    try { fn(next); } catch { /* ignore */ }
  }
}

export function getGameState(): GameState {
  return currentState;
}

export function getModule(): EmscriptenModule | null {
  return currentModule;
}

export function setModule(mod: EmscriptenModule | null): void {
  currentModule = mod;
}

export function getProfileId(): string | null {
  return currentProfileId;
}

export function setProfileId(id: string | null): void {
  currentProfileId = id;
}

export function subscribeGameState(fn: GameStateListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Push a SNES input bitmask to the running WASM module.
 * Called by InputManager each frame.
 */
export function setInput(mask: number): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetInput', null, ['number'], [mask]);
}

// ─── Game commands (pause, reset, cheats) ───

/** Pause or unpause the game at the WASM/C level. */
export function wasmSetPaused(paused: boolean): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetPaused', null, ['number'], [paused ? 1 : 0]);
}

/** Query whether the game is paused at the WASM/C level. */
export function wasmGetPaused(): boolean {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return false;
  return mod.ccall('WasmGetPaused', 'number', [], []) !== 0;
}

/** Toggle game pause at the WASM/C level. */
export function wasmTogglePause(): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmTogglePause', null, [], []);
}

/** Reset the game. warm=true preserves SRAM, warm=false is a cold reset. */
export function wasmReset(warm: boolean): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmReset', null, ['number'], [warm ? 1 : 0]);
}

/** Execute a cheat command. 'w' = health, 'W' = equipment, 'o' = keys. */
export function wasmCheat(cmd: string): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmCheat', null, ['number'], [cmd.charCodeAt(0)]);
}

// ─── Viewport Info (for edge glow shader) ───

export interface ViewportInfo {
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
}

/**
 * Read viewport/game-state info from WASM for shader edge detection.
 * Returns null if the module isn't running or the export doesn't exist yet.
 */
export function wasmGetViewportInfo(): ViewportInfo | null {
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

    // Black pixels = max extra - actual rendered extra
    const blackLeft = extraLeftRight - extraLeftCur;
    const blackRight = extraLeftRight - extraRightCur;
    // Bottom: extend_y adds 16 rows (240-224), extraBottomCur = how many have content
    const blackBottom = snesHeight === 240 ? (16 - extraBottomCur) : 0;

    // Active gameplay = module 7 (dungeon) or 9 (overworld)
    const isGameplay = (mainModule === 7 || mainModule === 9);

    return {
      mainModule, submodule, extraLeftRight, extraLeftCur, extraRightCur,
      extraBottomCur, snesWidth, snesHeight, blackLeft, blackRight, blackBottom, isGameplay,
    };
  } catch {
    return null;
  }
}

/**
 * Render a clean frame (no HUD/BG3) into WASM memory and return the pixel data.
 * Returns null if the module isn't running or the export doesn't exist.
 */
export function wasmRenderCleanFrame(): { data: Uint8Array; width: number; height: number } | null {
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
