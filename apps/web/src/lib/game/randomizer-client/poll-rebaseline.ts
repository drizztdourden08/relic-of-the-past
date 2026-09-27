/* @layer bridge-wasm @kind logic */
/**
 * The poller's baseline decision, kept pure so it can be tested without a core. Run on the
 * first tick and after every state load: whatever reads as complete stops being eligible.
 *
 * A local session adopts it all silently, since nothing outside the save needs telling. An
 * online session passes `isKnownReported`, and every complete entry the server does not
 * already hold is handed back in `toReport`: those are the checks made while no client was
 * connected, and the server learns of them here.
 *
 * Suppressed entries report from the substitution seam, never from polling, so they stay
 * out whatever the state shows.
 */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { PollEntry } from './location-poller';

interface RebaselineInput {
  entries: readonly PollEntry[];
  isComplete: (entry: PollEntry) => boolean;
  suppressed: ReadonlySet<string>;
  isKnownReported?: (key: LocationKey) => boolean;
}

interface RebaselineResult {
  reported: Set<string>;
  toReport: LocationKey[];
}

const rebaselineEntries = (input: RebaselineInput): RebaselineResult => {
  const { entries, isComplete, suppressed, isKnownReported } = input;
  const reported = new Set<string>(suppressed);
  const toReport: LocationKey[] = [];
  for (const entry of entries) {
    if (reported.has(entry.key) || !isComplete(entry)) continue;
    reported.add(entry.key);
    if (isKnownReported !== undefined && !isKnownReported(entry.key)) toReport.push(entry.key);
  }
  return { reported, toReport };
};

export { rebaselineEntries };
export type { RebaselineInput, RebaselineResult };
