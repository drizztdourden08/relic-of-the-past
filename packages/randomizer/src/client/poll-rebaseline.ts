/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '../world/location-key';
import type { RebaselineInput, RebaselineResult } from './poll-rebaseline.type';

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
export type { RebaselineInput, RebaselineResult } from './poll-rebaseline.type';
