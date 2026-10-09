/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { rebaselineEntries } from '../poll-rebaseline';
import type { HeapReads } from '../poll-heap-reads';
import { isEntryComplete } from './is-entry-complete';
import type { PollEntry, ReportingSession } from './location-poller.type';
import { pollerState } from './poller-state';

const applyRebaseline = (
  session: ReportingSession, entries: readonly PollEntry[], reads: HeapReads, completed: ReadonlySet<string>,
): void => {
  const { reported, suppressed, isKnownReported } = pollerState;
  const next = rebaselineEntries({
    entries, suppressed, isKnownReported, isComplete: (entry) => isEntryComplete(entry, reads, completed),
  });
  reported.clear();
  for (const key of next.reported) reported.add(key);
  log.randomizer(`[Poller] Re-baselined: ${reported.size}/${entries.length} already complete, ${next.toReport.length} unreported`);
  for (const key of next.toReport) session.reportCheck(key);
};

export { applyRebaseline };
