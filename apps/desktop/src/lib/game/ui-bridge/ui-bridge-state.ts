/* @layer bridge-wasm @kind logic */
import type { GameUIState } from '@rotp/game-data';

const uiBridgeState = {
  rafId: null as number | null,
  prevState: null as GameUIState | null,
  storeUpdater: null as ((state: GameUIState) => void) | null,
};

export { uiBridgeState };
