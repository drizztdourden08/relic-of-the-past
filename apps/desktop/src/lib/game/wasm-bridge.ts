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
