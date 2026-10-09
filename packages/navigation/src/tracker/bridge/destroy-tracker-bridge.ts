/* @layer bridge-wasm @kind logic */
import { trackerState } from './tracker-state';

const destroyTrackerBridge = (): void => {
  if (trackerState.pollIntervalId !== null) {
    clearInterval(trackerState.pollIntervalId);
    trackerState.pollIntervalId = null;
  }
  Object.assign(window, { __onItemReceived: null });
  trackerState.currentInventory = new Set();
  trackerState.currentCompletedChecks = new Set();
};

export { destroyTrackerBridge };
