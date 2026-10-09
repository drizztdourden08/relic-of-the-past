/* @layer bridge-wasm @kind logic */
import { getModule } from '../../wasm-bridge';
import { log } from '../../../log-bus';
import { getCompletedChecks } from '../../tracker';
import { rescanShopCatchUp } from '../apply-overrides';
import { buildHeapReads } from '../poll-heap-reads';
import { applyRebaseline } from './apply-rebaseline';
import { isEntryComplete } from './is-entry-complete';
import type { PollEntry, ReportingSession } from './location-poller.type';
import { pollerState } from './poller-state';

const pollOnce = (session: ReportingSession, entries: readonly PollEntry[]): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    rescanShopCatchUp();
    const reads = buildHeapReads(mod);
    if (!reads) return;
    const completed = getCompletedChecks();
    if (pollerState.rebaselinePending) {
      pollerState.rebaselinePending = false;
      applyRebaseline(session, entries, reads, completed);
      return;
    }
    for (const entry of entries) {
      if (pollerState.reported.has(entry.key) || entry.baselineOnly === true) continue;
      if (isEntryComplete(entry, reads, completed)) {
        pollerState.reported.add(entry.key);
        log.randomizer(`[Poller] Check completed: ${entry.key}`);
        session.reportCheck(entry.key);
      }
    }
  } catch {
    return;
  }
};

export { pollOnce };
