/* @layer shared-game @kind types */
import type { ItemKey } from '../world/item-ids';
import type { LocationKey } from '../world/location-key';
import type { Placement } from '../world/fill/placement.type';

interface LogicToggles {
  darkRoomsNeedLight: boolean;
  bigKeyDoors: boolean;
  smallKeyDoors: boolean;
}

interface PlacementReadRequest extends Partial<LogicToggles> {
  placement: Placement;
  completedLocations: ReadonlySet<LocationKey>;
  completedCheckIds: Iterable<string>;
  heldItems?: Iterable<ItemKey>;
}

type PlacementAvailabilityArgs = [
  placement: Placement,
  completedLocations: ReadonlySet<LocationKey>,
  darkRoomsNeedLight: boolean | undefined,
  heldItems: Iterable<ItemKey> | undefined,
  completedCheckIds: Iterable<string>,
];

export type { LogicToggles, PlacementAvailabilityArgs, PlacementReadRequest };
