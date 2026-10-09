/* @layer bridge-wasm @kind logic */
import type { ActiveSession } from './session-tracker.type';
import { sessionTrackerState } from './session-tracker-state';

const getActiveSession = (): ActiveSession | null => {
  return sessionTrackerState.activeSession;
};

export { getActiveSession };
