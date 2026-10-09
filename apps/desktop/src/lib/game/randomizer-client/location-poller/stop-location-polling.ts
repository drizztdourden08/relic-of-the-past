/* @layer bridge-wasm @kind logic */
import { pauseLocationPolling } from './pause-location-polling';
import { pollerState } from '@rotp/randomizer';

const stopLocationPolling = (): void => {
  pauseLocationPolling();
  pollerState.suppressed.clear();
};

export { stopLocationPolling };
