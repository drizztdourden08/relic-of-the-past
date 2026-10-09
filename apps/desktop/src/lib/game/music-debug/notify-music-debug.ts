/* @layer bridge-wasm @kind logic */
import { musicDebugState } from './music-debug-state';

const notifyMusicDebug = (): void => {
  musicDebugState.listeners.forEach((listener) => listener());
};

export { notifyMusicDebug };
