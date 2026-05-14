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
