/* @layer bridge-wasm @kind logic */
/**
 * Tracker statuses for a randomized session: availability comes from the
 * ported rule engine evaluated over the frozen placement, never from the
 * hand-authored vanilla dataset (which models neither the seed nor the
 * standard-mode escape). Completed checks crosswalk to placement locations
 * by their community-standard name; a check whose name is not a location of
 * this placement (event and prize slots, dataset gaps) can never inflate
 * availability, so it reports blocked unless the player actually completed it.
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
): Map<CheckId, CheckStatus> => {
  const completedLocations = new Set<string>();
  for (const checkId of completedChecks) completedLocations.add(standardCheckName(checkId));

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
