/* @layer bridge-wasm @kind logic */
import { getGameState, getModule } from '../../wasm-bridge';
import type { EmscriptenModule } from '../../types';

const callWhenRunning = <T>(fallback: T, fn: (mod: EmscriptenModule) => T): T => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return fallback;
  try {
    return fn(mod);
  } catch {
    return fallback;
  }
};

export { callWhenRunning };
