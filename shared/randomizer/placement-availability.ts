/* @layer shared-game @kind logic */
/**
 * Tracker-facing availability over a frozen placement. The player's logical
 * inventory is the multiset of items sitting at the locations they have
 * already completed (per the placement's nameView), plus every event and
 * dungeon-prize slot whose location is in logic for that inventory — the
 * reference sweep's semantics: an in-logic slot's content counts because the
 * player can go take it. A location is available when its region and access
 * rule pass under that state and it is not already completed.
 *
 * The world is rebuilt from the placement's own frozen record (the key-drop
 * option, the capacity profile, the medallion pair) and the nameView is loaded over the
 * fill seam, the same replay idiom the standard-mode verification uses — so
 * availability always answers for THIS seed under the ported rules, never
 * the hand-authored vanilla dataset.
 */
import { buildFillWorld } from './ap-world/fill/fill-world';
import { capacityProfileOfStats, capacityProgressiveOfStats } from './ap-world/fill/placement-capacity';
import { createCollectionState } from './ap-world/collection-state';
import { canCollectLocation } from './ap-world/rules/collect';
import type { ApWorld } from './ap-world/world.type';
import type { CollectionState } from './ap-world/collection-state';
import type { ApPlacement } from './ap-world/fill/ap-placement.type';

const worldFromPlacement = (placement: ApPlacement): ApWorld => {
  const { world } = buildFillWorld({
    keyDropShuffle: placement.stats.keyDropShuffle,
    capacity: capacityProfileOfStats(placement.stats),
    capacityProgressive: capacityProgressiveOfStats(placement.stats),
    medallions: placement.medallions,
  });
  for (const [location, item] of Object.entries(placement.nameView)) {
    world.placedItems.set(location, item);
  }
  return world;
};

/**
 * Fixpoint sweep over the auto-granted slots (event and prize locations):
 * an in-logic slot's content joins the inventory, which can open more.
 */
const sweepAutoGrantedSlots = (state: CollectionState, world: ApWorld): void => {
  const collected = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const location of world.locationsByName.values()) {
      if (!location.event && !location.prize) continue;
      if (collected.has(location.name)) continue;
      if (!canCollectLocation(state, location.name)) continue;
      const item = world.placedItems.get(location.name);
      if (item !== undefined) state.collect(item);
      collected.add(location.name);
      changed = true;
    }
  }
};

/**
 * The set of location names currently in logic and not yet completed, for
 * the given placement and set of completed location names.
 */
const computePlacementAvailability = (
  placement: ApPlacement,
  completedLocations: ReadonlySet<string>,
): Set<string> => {
  const world = worldFromPlacement(placement);
  const state = createCollectionState(world);

  for (const name of completedLocations) {
    const item = placement.nameView[name];
    if (item !== undefined) state.collect(item);
  }
  sweepAutoGrantedSlots(state, world);

  const available = new Set<string>();
  for (const name of world.locationsByName.keys()) {
    if (completedLocations.has(name)) continue;
    if (canCollectLocation(state, name)) available.add(name);
  }
  return available;
};

export { computePlacementAvailability };
