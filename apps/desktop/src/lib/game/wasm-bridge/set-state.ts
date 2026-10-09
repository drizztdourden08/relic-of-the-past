/* @layer bridge-wasm @kind logic */
import type { GameState } from '../types';
import { bridgeState } from './bridge-state';

const setState = (next: GameState): void => {
  bridgeState.currentState = next;
  for (const fn of bridgeState.listeners) {
    try { fn(next); } catch { continue; }
  }
};

export { setState };
