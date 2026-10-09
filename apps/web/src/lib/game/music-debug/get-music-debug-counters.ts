/* @layer bridge-wasm @kind logic */
import { musicDebugState } from './music-debug-state';
import type { MusicDebugCounter } from './music-debug.type';

const getMusicDebugCounters = (): MusicDebugCounter[] => {
  const state = musicDebugState;
  if (state.countersDirtyAt !== state.nextId) {
    state.countersDirtyAt = state.nextId;
    state.countersSnapshot = [...state.counters.values()].sort((a, b) => b.lastAt - a.lastAt);
  }
  return state.countersSnapshot;
};

export { getMusicDebugCounters };
