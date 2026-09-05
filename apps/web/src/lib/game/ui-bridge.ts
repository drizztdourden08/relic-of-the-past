/* @layer bridge-wasm @kind logic */
/**
 * High-frequency polling of game UI state from WASM.
 * Runs a requestAnimationFrame loop that reads the UI state buffer every frame,
 * parses it into a typed GameUIState (ui-bridge-parser), diffs it (ui-bridge-diff),
 * and pushes changes to the zustand store.
 */

import type { GameUIState } from '@shared/game/types';
import { wasmGetGameUIState } from './wasm-bridge';
import { pollHapticState, resetHapticPolling } from './haptic-polling';
import { parseGameUIBuffer } from './ui-bridge-parser';
import { stateChanged } from './ui-bridge-diff';


let rafId: number | null = null;
let prevState: GameUIState | null = null;
let storeUpdater: ((state: GameUIState) => void) | null = null;

// Previously paused the game when the map reached idle state, but this created a
// deadlock: pausing stops ZeldaRunFrame() which prevents input processing, so
// the player can never close the map. The game's own submodule system already
// handles map idle state correctly without external intervention.
const checkMapPause = (_state: GameUIState): void => {
  // no-op, map pause removed to fix input deadlock
};


const pollFrame = (): void => {
  const result = wasmGetGameUIState();
  if (result) {
    // Haptic polling runs every frame (even if UI state hasn't changed)
    pollHapticState(result.heap, result.ptr);

    const state = parseGameUIBuffer(result.heap, result.ptr);
    if (!prevState || stateChanged(prevState, state)) {
      prevState = state;
      checkMapPause(state);
      storeUpdater?.(state);
    }
  }
  rafId = requestAnimationFrame(pollFrame);
};


const initUIBridge = (updater: (state: GameUIState) => void): void => {
  storeUpdater = updater;
  if (rafId === null) {
    rafId = requestAnimationFrame(pollFrame);
  }
};

const stopUIBridge = (): void => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  prevState = null;
  storeUpdater = null;
  resetHapticPolling();
};

export { initUIBridge, parseGameUIBuffer, stopUIBridge };
