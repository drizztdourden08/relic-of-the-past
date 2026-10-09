/* @layer shared-game @kind logic */
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../../scope-tables';
import { spotOfFamily } from '../../capacity/capacity-spots';
import { NO_SLOT_RULE } from '../../pond/pond-vanilla-slots';
import { lockedTableSubset } from './locked-table-subset';
import type { PondVanillaSlots } from '../../pond/pond-vanilla-slots';
import type { LocationKey } from '../../location-key';
import type { CapacityProfile } from '../../capacity/capacity-profile.type';

const lockedScopeLocationsOf = (
  includeNpcChecks: boolean, includeWorldItems: boolean, capacity: CapacityProfile,
  deliverableNpcLocations?: ReadonlySet<LocationKey>,
  deliverableWorldLocations?: ReadonlySet<LocationKey>,
  pondSlots: PondVanillaSlots = NO_SLOT_RULE,
): ReadonlySet<LocationKey> => {
  const locked = new Set<LocationKey>();
  lockedTableSubset(NPC_SCOPE_LOCATIONS, includeNpcChecks, deliverableNpcLocations, locked);
  lockedTableSubset(WORLD_ITEM_SCOPE_LOCATIONS, includeWorldItems, deliverableWorldLocations, locked);
  for (const key of [...pondSlots.locked.keys(), ...pondSlots.pairAsPrizes]) locked.delete(key);
  const meterSpot = spotOfFamily('meter');
  if (capacity.meter.mode === 'vanilla' && meterSpot !== undefined) locked.add(meterSpot);
  return locked;
};

export { lockedScopeLocationsOf };
