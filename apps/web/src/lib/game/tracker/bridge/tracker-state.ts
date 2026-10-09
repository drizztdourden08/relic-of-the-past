/* @layer bridge-wasm @kind logic */
import type { TrackerState } from './bridge.type';

const trackerState: TrackerState = {
  itemListeners: new Set(),
  inventoryListeners: new Set(),
  unknownItemListeners: new Set(),
  completedChecksListeners: new Set(),
  eventStatusListeners: new Set(),
  currentInventory: new Set(),
  currentCompletedChecks: new Set(),
  currentEventStatus: new Map(),
  unknownItems: [],
  pollIntervalId: null,
};

export { trackerState };
