/* @layer bridge-wasm @kind logic */
import { FIRE_REPORTED_CLASSES } from './fire-reported-classes';
import type { PhysicalPlan } from './physical-plan.type';
import type { PollEntry } from './location-poller';

const baselineEntriesOf = (plan: PhysicalPlan): PollEntry[] =>
  plan.entries
    .filter((entry) => FIRE_REPORTED_CLASSES.has(entry.planClass) && entry.checkId !== undefined)
    .map((entry) => ({ key: entry.location, checkId: entry.checkId, baselineOnly: true }));

export { baselineEntriesOf };
