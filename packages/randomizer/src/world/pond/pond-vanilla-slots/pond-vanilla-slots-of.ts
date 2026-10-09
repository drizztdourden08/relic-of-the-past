/* @layer shared-game @kind logic */
import { POND_INSTANCES } from '../pond-instances';
import { presentRungsOf } from '../pond-spots';
import { NO_SLOT_RULE } from './pond-vanilla-slots.constants';
import type { ItemKey } from '../../item-ids';
import type { LocationKey } from '../../location-key';
import type { PondInstance } from '../pond-instance.type';
import type { PondProfiles } from '../pond-profiles.type';
import type { GrantingSlot, PondVanillaSlots } from '../pond.type';

const grantingSlotsOf = (pond: PondInstance): GrantingSlot[] =>
  pond.slots.filter((slot): slot is GrantingSlot => slot.vanillaGrant !== undefined);

const pondVanillaSlotsOf = (
  profiles: PondProfiles, deliverable: ReadonlySet<LocationKey> | undefined, followMode: boolean,
): PondVanillaSlots => {
  if (!followMode) return NO_SLOT_RULE;
  const locked = new Map<LocationKey, ItemKey>();
  const pairAsPrizes: LocationKey[] = [];
  for (const pond of POND_INSTANCES) {
    const setting = profiles[pond.id];
    const slots = grantingSlotsOf(pond);
    if (setting.mode === 'capacity') {
      for (const slot of slots) locked.set(slot.key, slot.vanillaGrant);
    }
    if (setting.mode === 'custom' && presentRungsOf(setting, pond, deliverable).length > 0) {
      pairAsPrizes.push(...slots.map((slot) => slot.key));
    }
  }
  return { locked, pairAsPrizes };
};

export { pondVanillaSlotsOf };
