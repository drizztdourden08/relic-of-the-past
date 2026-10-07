/* @layer bridge-wasm @kind logic */
/**
 * The armed overrides an online baseline must still look at. Their completion reports live
 * from the substitution seam, so the plan never polls them; a pickup made while no client
 * was connected fired to nobody, and only the save (the tracker's completed set, which reads
 * an armed giver's real taken-bit) still shows it.
 */
import { FIRE_REPORTED_CLASSES } from './fire-reported-classes';
import type { PhysicalPlan } from './physical-plan.type';
import type { PollEntry } from './location-poller';

const baselineEntriesOf = (plan: PhysicalPlan): PollEntry[] =>
  plan.entries
    .filter((entry) => FIRE_REPORTED_CLASSES.has(entry.planClass) && entry.checkId !== undefined)
    .map((entry) => ({ key: entry.location, checkId: entry.checkId, baselineOnly: true }));

export { baselineEntriesOf };
