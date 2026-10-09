/* @layer bridge-wasm @kind logic */
import type { GameUIState } from '@rotp/game-data';
import { pollFrame } from './poll-frame';
import { uiBridgeState } from './ui-bridge-state';

const initUIBridge = (updater: (state: GameUIState) => void): void => {
  uiBridgeState.storeUpdater = updater;
  if (uiBridgeState.rafId === null) {
    uiBridgeState.rafId = requestAnimationFrame(pollFrame);
  }
};

export { initUIBridge };
