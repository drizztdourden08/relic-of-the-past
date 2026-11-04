/* @layer renderer-app @kind logic */
import type { PollEntry as RotpPollEntry } from '@rotp/randomizer';
import type { PollEntry } from '@drizztdourden08/brock-randomizer/session';
import { probeOfDetection } from './probe-of-detection';

const pollEntryOf = (entry: RotpPollEntry): PollEntry => ({
  key: entry.key,
  ...(entry.checkId !== undefined ? { checkId: entry.checkId } : {}),
  ...(entry.detection !== undefined ? { probe: probeOfDetection(entry.detection) } : {}),
  ...(entry.baselineOnly === true ? { baselineOnly: true } : {}),
});

const pollEntriesOfPlan = (entries: readonly RotpPollEntry[]): PollEntry[] => entries.map(pollEntryOf);

export { pollEntriesOfPlan };
