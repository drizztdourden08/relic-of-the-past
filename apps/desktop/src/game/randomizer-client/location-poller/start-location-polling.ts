/* @layer bridge-wasm @kind logic */
import type { LocationKey, PollEntry } from '@rotp/randomizer';
import { pollEntriesOfPlan } from '@app/randomizer/rotp-randomizer/poll-entries-of-plan';
import { onlinePoller } from './online-poller';
import type { PollReporter } from './poll-reporter.type';
import { suppressSink } from './suppress-sink';

const asLocationKey = (key: string): LocationKey => key as LocationKey;

const startLocationPolling = (
  session: PollReporter, entries: readonly PollEntry[], knownReported?: (key: LocationKey) => boolean,
): void => {
  onlinePoller.start(pollEntriesOfPlan(entries), {
    report: (key) => session.reportCheck(asLocationKey(key)),
    ...(knownReported !== undefined ? { isKnownReported: (key: string) => knownReported(asLocationKey(key)) } : {}),
  });
  suppressSink.current = onlinePoller.suppress;
};

export { startLocationPolling };
