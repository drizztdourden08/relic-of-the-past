/* @layer bridge-wasm @kind logic */
import { musicDebugState } from './music-debug-state';
import { notifyMusicDebug } from './notify-music-debug';

const clearMusicDebug = (): void => {
  musicDebugState.events = [];
  musicDebugState.counters.clear();
  notifyMusicDebug();
};

export { clearMusicDebug };
