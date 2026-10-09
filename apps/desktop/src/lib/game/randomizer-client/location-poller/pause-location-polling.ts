/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { pollerState } from '@rotp/randomizer';

const pauseLocationPolling = (): void => {
  if (pollerState.intervalId !== null) {
    clearInterval(pollerState.intervalId);
    pollerState.intervalId = null;
    log.randomizer('[Poller] Location polling stopped');
  }
  pollerState.reported.clear();
  pollerState.polledEntries = [];
  pollerState.rebaselinePending = false;
  pollerState.isKnownReported = undefined;
};

export { pauseLocationPolling };
