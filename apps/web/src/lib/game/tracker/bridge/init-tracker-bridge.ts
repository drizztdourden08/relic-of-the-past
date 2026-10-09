/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { POLL_INTERVAL_MS } from './bridge.constants';
import { handleItemReceived } from './handle-item-received';
import { notifyUnknownItems } from './notify-unknown-items';
import { pollInventoryState } from './poll-inventory-state';
import { trackerState } from './tracker-state';

const initTrackerBridge = (): void => {
  log.app('Initializing tracker bridge');

  Object.assign(window, { __onItemReceived: handleItemReceived });

  trackerState.unknownItems = [];
  notifyUnknownItems();

  if (trackerState.pollIntervalId !== null) clearInterval(trackerState.pollIntervalId);
  trackerState.pollIntervalId = setInterval(pollInventoryState, POLL_INTERVAL_MS);
  pollInventoryState(true);
};

export { initTrackerBridge };
