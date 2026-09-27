/* @layer bridge-wasm @kind logic */
/**
 * Tracker statuses for a randomized session: availability comes from the
 * ported rule engine evaluated over the frozen placement, never from the
 * hand-authored normal dataset (which models neither the seed nor the
 * standard-mode escape). Completed checks crosswalk to placement locations
 * by their community-standard name; a check whose name is not a location of
 * this placement (event and prize slots, genuine dataset gaps) can never
 * inflate availability, so it reports blocked unless the player actually
 * completed it. A shelf slot or pond prize past the reference's two has no
 * check record at all (see override-fire-registry.ts), so its own completion
 * never reaches `completedChecks`. firedLocationKeys is the session's
 * separate record of those substitutions, folded in here so their items
 * still enter the collected-item state the rule engine evaluates against.
 *
 * `checks` carries both real, registered CheckRecords and the virtual ones
 * virtual-locations.ts synthesizes for every world location none of those cover
 * (shop slots, chiefly): a virtual id is never in the live-polled
 * completedChecks set, so its status reads off completedLocations /
 * available by its own name instead of the crosswalk.
 *
 * completedLocations answers for BOTH kinds. A real check whose normal detection cannot
 * fire in this seed is otherwise stuck at reachable forever, which is exactly what the
 * pond's two named slots do: they poll the capacity counter bytes, and a randomized pond
 * hands over a pool item without writing either one.
 */
import { computePlacementReach } from '@shared/randomizer/placement-availability';
import { BIG_KEY_ITEMS } from '@shared/randomizer/world/big-keys';
import { fullKeyRing } from '@shared/randomizer/world/small-keys';
import { screensOfRegions } from '@shared/game/logic/regions/reachable-screens';
import { completedLocationKeys } from './check-names';
import { virtualLocationOf } from './virtual-locations';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';

interface TrackerReading {
  statuses: Map<CheckId, CheckStatus>;
  /** The dataset screens the engine's regions come out to, for the rows read from the records. */
  reachableScreens: Set<string>;
}

const trackerReading = (
  placement: Placement,
  completedChecks: ReadonlySet<CheckId>,
  checks: readonly CheckRecord[],
  firedLocationKeys: ReadonlySet<LocationKey> = new Set(),
  darkRoomsNeedLight = true,
  /** The dataset item ids the player is really holding, which the seed world reads by pool name. */
  heldItemIds: ReadonlySet<ItemId> = new Set(),
  /**
   * The tracker's "Big Key doors" switch. Off reads every one of those doors as open, which is
   * done by putting the keys in the state's hands: a door whose key is held is open, and no rule
   * needs a second version of itself to say it (world/big-keys.ts).
   */
  bigKeyDoors = true,
  /**
   * The tracker's "Small Keys" switch. Off reads every small key door as open the same way:
   * each dungeon's keys go in the state's hands, as many as any rule counts (world/small-keys.ts).
   */
  smallKeyDoors = true,
): TrackerReading => {
  const completedLocations = completedLocationKeys(completedChecks, firedLocationKeys);

  const held: ItemKey[] = [...heldItemIds];
  if (!bigKeyDoors) held.push(...BIG_KEY_ITEMS);
  if (!smallKeyDoors) held.push(...fullKeyRing());
  // The completed set carries the event rows too, which is the record of what the player
  // actually did. Handing the ids over lets the rules ask about an act instead of guessing
  // it from an item or from the lever being within reach.
  const { available, reachableRegions } = computePlacementReach(
    placement, completedLocations, darkRoomsNeedLight, held, completedChecks,
  );

  const snapshot = new Map<CheckId, CheckStatus>();
  for (const check of checks) {
    const isVirtual = check.id.startsWith('check-virtual-');
    if (!isVirtual && completedChecks.has(check.id)) {
      snapshot.set(check.id, 'completed');
      continue;
    }
    const location = isVirtual ? virtualLocationOf(check.id) : check.id;
    // A fired location answers for a REAL check too, not only a virtual one. The pond's
    // first two slots keep the check records the reference's names gave them, and those
    // records poll the capacity counter bytes a purchase used to write; a randomized pond
    // hands over a pool item and never touches them, so the seam's own record is the only
    // thing that knows the slot was taken.
    if (completedLocations.has(location)) {
      snapshot.set(check.id, 'completed');
      continue;
    }
    snapshot.set(check.id, available.has(location) ? 'reachable' : 'blocked');
  }
  return { statuses: snapshot, reachableScreens: screensOfRegions(reachableRegions) };
};

/** The statuses alone, for a caller with no use for the place. */
const computeTrackerSnapshot = (
  ...args: Parameters<typeof trackerReading>
): Map<CheckId, CheckStatus> => trackerReading(...args).statuses;

export { trackerReading, computeTrackerSnapshot };
export type { TrackerReading };
