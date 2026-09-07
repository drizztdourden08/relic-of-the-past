/* @layer bridge-wasm @kind logic */
/**
 * Tracker statuses for a randomized session: availability comes from the
 * ported rule engine evaluated over the frozen placement, never from the
 * hand-authored vanilla dataset (which models neither the seed nor the
 * standard-mode escape). Completed checks crosswalk to placement locations
 * by their community-standard name; a check whose name is not a location of
 * this placement (event and prize slots, genuine dataset gaps) can never
 * inflate availability, so it reports blocked unless the player actually
 * completed it. A shelf slot or pond prize past the reference's two has no
 * check record at all (see override-fire-registry.ts), so its own completion
 * never reaches `completedChecks`. firedLocationNames is the session's
 * separate record of those substitutions, folded in here so their items
 * still enter the collected-item state the rule engine evaluates against.
 */
import { computePlacementAvailability } from '@shared/randomizer/placement-availability';
import { standardCheckName } from './check-names';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { CheckId, CheckRecord } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';

const computeApTrackerSnapshot = (
  placement: ApPlacement,
  completedChecks: ReadonlySet<CheckId>,
  checks: readonly CheckRecord[],
  firedLocationNames: ReadonlySet<string> = new Set(),
): Map<CheckId, CheckStatus> => {
  const completedLocations = new Set<string>();
  for (const checkId of completedChecks) completedLocations.add(standardCheckName(checkId));
  for (const name of firedLocationNames) completedLocations.add(name);

  const available = computePlacementAvailability(placement, completedLocations);

  const snapshot = new Map<CheckId, CheckStatus>();
  for (const check of checks) {
    if (completedChecks.has(check.id)) {
      snapshot.set(check.id, 'completed');
      continue;
    }
    snapshot.set(check.id, available.has(standardCheckName(check.id)) ? 'reachable' : 'blocked');
  }
  return snapshot;
};

export { computeApTrackerSnapshot };
