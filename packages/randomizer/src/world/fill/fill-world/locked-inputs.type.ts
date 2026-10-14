/* @layer shared-game @kind types */
import type { CapacityProfile } from '../../capacity/capacity-profile.type';
import type { ItemKey } from '../../item-ids';
import type { LocationKey } from '../../location-key';
import type { PondVanillaSlots } from '../../pond/pond-vanilla-slots';
import type { World } from '../../world.type';

interface LockedScopeInput {
  includeNpcChecks: boolean;
  includeWorldItems: boolean;
  capacity: CapacityProfile;
  deliverableNpcLocations?: ReadonlySet<LocationKey>;
  deliverableWorldLocations?: ReadonlySet<LocationKey>;
  pondSlots?: PondVanillaSlots;
}

interface LockedVanillaInput {
  world: World;
  keyDropShuffle: boolean;
  lockedScope: ReadonlySet<LocationKey>;
  lockedPondGrants: ReadonlyMap<LocationKey, ItemKey>;
  lockedCapacity: ReadonlySet<LocationKey>;
}

export type { LockedScopeInput, LockedVanillaInput };
