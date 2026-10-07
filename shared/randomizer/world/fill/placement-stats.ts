/* @layer shared-game @kind logic */
/**
 * The option-derived stats a placement records, read off the fill world it was built on.
 * One function for both producers: the generator after a successful fill, and an online
 * session rebuilding a placement from a server's scouts (scouts-to-placement.ts), so the
 * two can never record the same options differently.
 */
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-tables';
import { presentCapacitySpots } from '../capacity/capacity-spots';
import type { DeliverableSets } from './fill-options-from-snapshot';
import type { FillWorld } from './fill-world.type';
import type { LocationKey } from '../location-key';
import type { PlacementStats } from './placement.type';

interface PlacementStatsInput {
  fillWorld: FillWorld;
  /** 1-based attempt that produced the seed. */
  attempts: number;
  shufflePrizes: boolean;
  deliverable: Required<DeliverableSets>;
  sphereCount: number;
}

const countIn = (keys: Iterable<LocationKey>, deliverable: ReadonlySet<LocationKey>): number =>
  [...keys].filter((key) => deliverable.has(key)).length;

const placementStatsOf = (input: PlacementStatsInput): PlacementStats => {
  const { fillWorld, attempts, shufflePrizes, deliverable, sphereCount } = input;
  const {
    world, keyDropShuffle, includeNpcChecks, includeWorldItems, capacity, capacityProgressive, capacityBonus,
    capacityCounts, shops, ponds, pondSlotsFollowMode, pondLocations, darkRooms, storyGates, progressiveTiers,
    progressiveModes, itemPower, retroBow, dungeonItems, accessibility,
  } = fillWorld;
  const fairySpots = presentCapacitySpots(capacity);
  return {
    attempts,
    keyDropShuffle,
    includeNpcChecks,
    includeWorldItems,
    shufflePrizes,
    capacity,
    capacityProgressive,
    capacityBonus,
    capacityCounts,
    npcDeliverableCount: includeNpcChecks ? countIn(NPC_SCOPE_LOCATIONS.keys(), deliverable.npc) : 0,
    worldDeliverableCount: includeWorldItems ? countIn(WORLD_ITEM_SCOPE_LOCATIONS.keys(), deliverable.world) : 0,
    capacityDeliverableCount: countIn(fairySpots, deliverable.capacity),
    ponds,
    darkRooms,
    storyGates,
    pondPrizeCount: pondLocations.length,
    pondSlotsFollowMode,
    progressiveTiers,
    progressiveModes,
    retroBow,
    itemPower,
    dungeonItems,
    accessibility,
    shops,
    locationCount: world.locationsByKey.size,
    sphereCount,
  };
};

export { placementStatsOf };
export type { PlacementStatsInput };
