/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { POLL_INTERVAL_MS } from './location-poller.constants';
import type { PollEntry, ReportingSession } from './location-poller.type';
import { pauseLocationPolling } from './pause-location-polling';
import { pollOnce } from './poll-once';
import { pollerState } from './poller-state';

const startLocationPolling = (
  session: ReportingSession, entries: readonly PollEntry[], knownReported?: (key: LocationKey) => boolean,
): void => {
  pauseLocationPolling();
  pollerState.rebaselinePending = true;
  pollerState.isKnownReported = knownReported;
  pollerState.polledEntries = entries;
  log.randomizer(`[Poller] Location polling started: ${entries.length} checks (every ${POLL_INTERVAL_MS}ms)`);
  pollerState.intervalId = setInterval(() => pollOnce(session, pollerState.polledEntries), POLL_INTERVAL_MS);
};

export { startLocationPolling };
