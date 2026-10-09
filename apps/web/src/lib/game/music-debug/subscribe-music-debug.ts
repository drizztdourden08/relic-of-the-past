/* @layer bridge-wasm @kind logic */
import { musicDebugState } from './music-debug-state';

const subscribeMusicDebug = (listener: () => void): (() => void) => {
  musicDebugState.listeners.add(listener);
  return () => { musicDebugState.listeners.delete(listener); };
};

export { subscribeMusicDebug };
