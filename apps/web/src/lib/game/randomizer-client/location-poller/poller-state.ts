/* @layer bridge-wasm @kind logic */
import type { PollerState } from './location-poller.type';

const pollerState: PollerState = {
  intervalId: null,
  polledEntries: [],
  rebaselinePending: false,
  isKnownReported: undefined,
  reported: new Set(),
  suppressed: new Set(),
};

export { pollerState };
