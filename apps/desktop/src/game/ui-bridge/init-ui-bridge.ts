/* @layer bridge-wasm @kind logic */
import type { GameUIState } from '@rotp/game-data';
import { pollFrame } from './poll-frame';
import { uiBridgeState } from '@rotp/game-core';

const initUIBridge = (updater: (state: GameUIState) => void): void => {
  uiBridgeState.storeUpdater = updater;
  uiBridgeState.rafId ??= requestAnimationFrame(pollFrame);
};

export { initUIBridge };
