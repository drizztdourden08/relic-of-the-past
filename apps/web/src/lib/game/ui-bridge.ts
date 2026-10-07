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
import { pollDialogFrame } from './dialog/dialog-bridge';
import { observeGear } from './gear-ownership';
import { reassertAfterSaveLoad } from './host-menu';


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

// Post-file-load repair. Leaving the title/file-select modules is the one moment the core has just
// copied a save FILE out of SRAM into WRAM, and with it hud_cur_item_x/l/r, the abandoned lane
// design's per-button registers. Two vendored paths read those bytes with no feature bit of their own
// (see HostMenu_DropSecondaryItems in core/game-hooks/host_menu.c), so an old save silently moves the
// map button to Select while the modern scheme is still sending X. Re-arming the takeover here
// re-zeroes them; it is a no-op when the host never armed one.
const checkSaveFileLoad = (prev: GameUIState | null, next: GameUIState): void => {
  if (prev?.mode !== 'title' || next.mode === 'title') return;
  reassertAfterSaveLoad();
};


const pollFrame = (): void => {
  const result = wasmGetGameUIState();
  if (result) {
    // Haptic polling runs every frame (even if UI state hasn't changed)
    pollHapticState(result.heap, result.ptr);

    const state = parseGameUIBuffer(result.heap, result.ptr);
    if (!prevState || stateChanged(prevState, state)) {
      checkSaveFileLoad(prevState, state);
      // The gear high-water mark follows the state decoded here instead of a store
      // subscription, so it is recorded whether or not the pause menu has ever been opened
      // this session. A tier earned and then dropped has to stay reversible either way.
      // The whole state, not its equipment block: the arrow row's mark is an inventory byte.
      observeGear(state);
      prevState = state;
      checkMapPause(state);
      storeUpdater?.(state);
    }
  }
  // The message box mirror rides the same loop, with its own change check.
  pollDialogFrame();
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
