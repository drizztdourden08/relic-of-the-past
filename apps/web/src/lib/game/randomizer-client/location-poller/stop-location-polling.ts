/* @layer bridge-wasm @kind logic */
import { pauseLocationPolling } from './pause-location-polling';
import { pollerState } from './poller-state';

const stopLocationPolling = (): void => {
  pauseLocationPolling();
  pollerState.suppressed.clear();
};

export { stopLocationPolling };
