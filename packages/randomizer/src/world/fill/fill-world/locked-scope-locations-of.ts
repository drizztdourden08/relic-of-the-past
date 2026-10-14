/* @layer shared-game @kind logic */
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../../scope-tables';
import { spotOfFamily } from '../../capacity/capacity-spots';
import { NO_SLOT_RULE } from '../../pond/pond-vanilla-slots';
import { lockedTableSubset } from './locked-table-subset';
import type { LocationKey } from '../../location-key';
import type { LockedScopeInput } from './locked-inputs.type';

const lockedScopeLocationsOf = (input: LockedScopeInput): ReadonlySet<LocationKey> => {
  const {
    includeNpcChecks, includeWorldItems, capacity, deliverableNpcLocations, deliverableWorldLocations,
    pondSlots = NO_SLOT_RULE,
  } = input;
  const locked = new Set<LocationKey>();
  lockedTableSubset(NPC_SCOPE_LOCATIONS, includeNpcChecks, deliverableNpcLocations, locked);
  lockedTableSubset(WORLD_ITEM_SCOPE_LOCATIONS, includeWorldItems, deliverableWorldLocations, locked);
  for (const key of [...pondSlots.locked.keys(), ...pondSlots.pairAsPrizes]) locked.delete(key);
  const meterSpot = spotOfFamily('meter');
  if (capacity.meter.mode === 'vanilla' && meterSpot !== undefined) locked.add(meterSpot);
  return locked;
};

export { lockedScopeLocationsOf };
