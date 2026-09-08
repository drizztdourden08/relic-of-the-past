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
 *
 * `checks` carries both real, registered CheckRecords and the virtual ones
 * virtual-locations.ts synthesizes for every AP location none of those cover
 * (shop slots, chiefly): a virtual id is never in the live-polled
 * completedChecks set, so its status reads off completedLocations /
 * available by its own randomizerName instead of the crosswalk.
 *
 * completedLocations answers for BOTH kinds. A real check whose vanilla detection cannot
 * fire in this seed is otherwise stuck at reachable forever, which is exactly what the
 * pond's two named slots do: they poll the capacity counter bytes, and a randomized pond
 * hands over a pool item without writing either one.
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
    const isVirtual = check.id.startsWith('check-virtual-');
    if (!isVirtual && completedChecks.has(check.id)) {
      snapshot.set(check.id, 'completed');
      continue;
    }
    const locationName = isVirtual ? check.randomizerName : standardCheckName(check.id);
    // A fired location answers for a REAL check too, not only a virtual one. The pond's
    // first two slots keep the check records the reference's names gave them, and those
    // records poll the capacity counter bytes a purchase used to write; a randomized pond
    // hands over a pool item and never touches them, so the seam's own record is the only
    // thing that knows the slot was taken.
    if (completedLocations.has(locationName)) {
      snapshot.set(check.id, 'completed');
      continue;
    }
    snapshot.set(check.id, available.has(locationName) ? 'reachable' : 'blocked');
  }
  return snapshot;
};

export { computeApTrackerSnapshot };
