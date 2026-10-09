/* @layer bridge-wasm @kind logic */
import type { ActiveSession } from './session-tracker.type';

const sessionTrackerState = {
  activeSession: null as ActiveSession | null,
};

export { sessionTrackerState };
