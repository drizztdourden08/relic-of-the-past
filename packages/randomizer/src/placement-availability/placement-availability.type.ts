/* @layer shared-game @kind types */
import type { RegionId } from '@rotp/game-data';
import type { ItemKey } from '../world/item-ids';
import type { LocationKey } from '../world/location-key';
import type { Placement } from '../world/fill/placement.type';

interface PlacementReach {
  available: Set<LocationKey>;
  reachableRegions: Set<RegionId>;
}

interface ReachRequest {
  placement: Placement;
  completedLocations: ReadonlySet<LocationKey>;
  darkRoomsNeedLight?: boolean;
  heldItems?: Iterable<ItemKey>;
  completedCheckIds?: Iterable<string>;
}

type PlacementAvailabilityArgs = [
  placement: Placement,
  completedLocations: ReadonlySet<LocationKey>,
  darkRoomsNeedLight?: boolean,
  heldItems?: Iterable<ItemKey>,
  completedCheckIds?: Iterable<string>,
];

export type { PlacementAvailabilityArgs, PlacementReach, ReachRequest };
