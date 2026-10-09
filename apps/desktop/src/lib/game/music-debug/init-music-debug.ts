/* @layer bridge-wasm @kind logic */
import { subscribeMsuDebug } from '../../msu/debug-bus';
import { subscribeGameState } from '@rotp/game-core';
import { musicDebugState } from './music-debug-state';
import { traceHandlers } from './trace-handlers';

const initMusicDebug = (): void => {
  if (musicDebugState.installed) return;
  musicDebugState.installed = true;
  window.__onSoundTrace = traceHandlers.onSoundTrace;
  window.__onMusicTrace = traceHandlers.onMusicTrace;
  subscribeMsuDebug(traceHandlers.onMsuDebug);
  subscribeGameState(traceHandlers.onGameState);
};

export { initMusicDebug };
