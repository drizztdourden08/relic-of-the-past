/* @layer bridge-wasm @kind logic */
import { subscribeMsuDebug } from '../player/debug-bus';
import { getGameState, subscribeGameState } from '@rotp/game-core';
import { musicDebugState } from './music-debug-state';
import { traceHandlers } from './trace-handlers';

const initMusicDebug = (): void => {
  if (musicDebugState.installed) return;
  musicDebugState.installed = true;
  window.__onSoundTrace = traceHandlers.onSoundTrace;
  window.__onMusicTrace = traceHandlers.onMusicTrace;
  subscribeMsuDebug(traceHandlers.onMsuDebug);
  subscribeGameState(traceHandlers.onGameState);
  traceHandlers.onGameState(getGameState());
};

export { initMusicDebug };
