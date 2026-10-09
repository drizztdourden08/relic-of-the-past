/* @layer bridge-wasm @kind logic */
import type { GameUIState } from '@rotp/game-data';
import { wasmGetGameUIState } from '@rotp/game-core';
import { pollHapticState } from '@rotp/game-core';
import { parseGameUIBuffer } from '@rotp/game-core';
import { stateChanged } from '@rotp/game-core';
import { pollDialogFrame } from '@rotp/game-core';
import { observeGear } from '../gear-ownership';
import { reassertAfterSaveLoad } from '@rotp/game-core';
import { uiBridgeState } from '@rotp/game-core';

const repairAfterSaveFileLoad = (prev: GameUIState | null, next: GameUIState): void => {
  const leftTitle = prev?.mode === 'title' && next.mode !== 'title';
  if (!leftTitle) return;
  reassertAfterSaveLoad();
};

const pollFrame = (): void => {
  const result = wasmGetGameUIState();
  if (result) {
    pollHapticState(result.heap, result.ptr);

    const state = parseGameUIBuffer(result.heap, result.ptr);
    const { prevState } = uiBridgeState;
    if (!prevState || stateChanged(prevState, state)) {
      repairAfterSaveFileLoad(prevState, state);
      observeGear(state);
      uiBridgeState.prevState = state;
      uiBridgeState.storeUpdater?.(state);
    }
  }
  pollDialogFrame();
  uiBridgeState.rafId = requestAnimationFrame(pollFrame);
};

export { pollFrame };
