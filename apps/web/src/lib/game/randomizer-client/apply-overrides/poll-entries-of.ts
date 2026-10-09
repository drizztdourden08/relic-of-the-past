/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { isReportableCheck } from '../check-detection';
import { FIRE_REPORTED_CLASSES } from '../fire-reported-classes';
import type { PhysicalPlan } from '../physical-plan.type';
import type { PollEntry } from '../location-poller';

const pollEntriesOf = (plan: PhysicalPlan, tag: string): PollEntry[] => {
  const entries: PollEntry[] = [];
  for (const entry of plan.entries) {
    if (FIRE_REPORTED_CLASSES.has(entry.planClass)) continue;
    const answersThroughTrackerSweep = entry.checkId !== undefined && isReportableCheck(entry.checkId);
    if (entry.detection === undefined && !answersThroughTrackerSweep) {
      log.randomizer(`${tag} Poll-blind (vanilla-locked, never reported): "${entry.location}"`, 'warn');
      continue;
    }
    entries.push({
      key: entry.location,
      ...(answersThroughTrackerSweep ? { checkId: entry.checkId } : {}),
      ...(entry.detection !== undefined ? { detection: entry.detection } : {}),
    });
  }
  return entries;
};

export { pollEntriesOf };
