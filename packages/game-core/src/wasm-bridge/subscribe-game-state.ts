/* @layer bridge-wasm @kind logic */
import { bridgeState } from './bridge-state';
import type { GameStateListener } from './wasm-bridge.type';

const replayCurrentState = (fn: GameStateListener): void => {
  if (!bridgeState.listeners.has(fn)) return;
  try { fn(bridgeState.currentState); } catch { return undefined; }
};

const subscribeGameState = (fn: GameStateListener): () => void => {
  bridgeState.listeners.add(fn);
  queueMicrotask(() => replayCurrentState(fn));
  return () => bridgeState.listeners.delete(fn);
};

export { subscribeGameState };
