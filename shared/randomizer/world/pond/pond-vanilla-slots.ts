/* @layer shared-game @kind logic */
/**
 * What a wish pond's mode does to her own two slots, which are rungs 1 and 2 of her ladder
 * (`Waterfall Fairy 1/2` and `Pyramid Fairy 1/2`).
 *
 *   capacity (Vanilla grants): LOCKED to what her upgrade produces (the slot's
 *     `vanillaGrant`), and that item leaves the pool. The item she takes in
 *     trade stays in the pool, so the player can still find it and throw it.
 *     This is its own table on purpose: the npc scope's translation of the
 *     same rows (scope-vanilla.data.ts) is pool accounting for its switch, and
 *     at the wishing pond it names the boomerang she consumes.
 *   vanilla-cost: untouched. The two slots are the pond's two checks and the
 *     npc scope decides them, as it always has.
 *   custom: SOLD AS PRIZES, once the pond really carries rungs. The core shuts the pond
 *     after its last rung, so her upgrade can never run: the two names are prizes 1 and 2
 *     of the ladder instead, and the npc scope no longer decides them. Her vanilla items
 *     stay in the pool, because the silver bow and the golden sword have nowhere else to
 *     come from.
 *
 * A custom pond with no rung in the world (no pool item, or a seam the probe
 * did not certify) arms nothing in the core, so the native upgrade still runs
 * and both slots stay what the npc scope makes them.
 *
 * `followMode` false is the reference oracles' world: the slots answer to the
 * npc scope alone whatever the mode says.
 */
import type { ItemId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import { POND_INSTANCES } from './pond-instances';
import { presentRungsOf } from './pond-spots';
import type { PondInstance, PondSlot } from './pond-instance.type';
import type { PondProfiles } from './pond-profiles.type';

interface PondVanillaSlots {
  /** Slot → the item her upgrade produces there; pre-placed, and removed from the pool. */
  locked: ReadonlyMap<LocationKey, ItemKey>;
  /** Slots the pond sells as prize rungs; their vanilla items stay in the pool. */
  pairAsPrizes: readonly LocationKey[];
}

const NO_SLOT_RULE: PondVanillaSlots = { locked: new Map(), pairAsPrizes: [] };

type GrantingSlot = PondSlot & { vanillaGrant: ItemId };

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

export { NO_SLOT_RULE, pondVanillaSlotsOf };
export type { PondVanillaSlots };
