/* @layer bridge-wasm @kind logic */
import type { MusicDebugState } from './music-debug.type';

const musicDebugState: MusicDebugState = {
  nextId: 0,
  events: [],
  counters: new Map(),
  listeners: new Set(),
  armed: false,
  installed: false,
  countersSnapshot: [],
  countersDirtyAt: -1,
};

export { musicDebugState };
