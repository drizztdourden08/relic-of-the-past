/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import type { LocationKey } from '@rotp/randomizer';
import { POLL_INTERVAL_MS } from '@rotp/randomizer';
import type { PollEntry, ReportingSession } from '@rotp/randomizer';
import { pauseLocationPolling } from './pause-location-polling';
import { pollOnce } from './poll-once';
import { pollerState } from '@rotp/randomizer';

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
