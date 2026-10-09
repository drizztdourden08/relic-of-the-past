/* @layer bridge-wasm @kind logic */
import { musicDebugState } from './music-debug-state';
import type { MusicDebugEvent } from './music-debug.type';

const getMusicDebugEvents = (): MusicDebugEvent[] => musicDebugState.events;

export { getMusicDebugEvents };
