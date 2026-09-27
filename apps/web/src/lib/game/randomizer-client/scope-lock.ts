/* @layer bridge-wasm @kind logic */
/**
 * Scope locking: which planned locations the session treats as locked
 * vanilla, and the vanilla item a capability-locked location must still
 * hold. Four lock sources: an option toggled off locks its whole scope
 * table (key drops / npc gifts / world items), with a toggle on the
 * capability probe's undeliverable remainder stays locked so generation and
 * the session always name the same locations, and the boss-prize slots are
 * locked whenever the placement was generated without the prize shuffle
 * (vanilla-prizes.data.ts).
 */

import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import {
  CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS,
  VANILLA_PRIZES, WORLD_ITEM_SCOPE_LOCATIONS,
} from '@shared/randomizer/world/scope-tables';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import type { ShopPriceView } from '@shared/randomizer/world/shops/shop-price.type';
import type { WishPondRungKey } from './wish-pond-rung-keys';

interface ScopeFlags {
  keyDropShuffle: boolean;
  includeNpcChecks: boolean;
  /**
   * Whether the boss rewards were shuffled. Off (and absent, for the online
   * flags) keeps every reward slot locked to its vanilla prize.
   */
  shufflePrizes?: boolean;
  includeWorldItems: boolean;
  /**
   * npc option ON only: scope locations generation keeps vanilla because they
   * have no certified physical path (npc-capability). Absent (the online
   * flags) means nothing is capability-locked.
   */
  npcLockedLocations?: ReadonlySet<LocationKey>;
  /** World-item option ON only: same mechanism over the world-item table. */
  worldLockedLocations?: ReadonlySet<LocationKey>;
  /**
   * The capacity spots generation keeps vanilla under the placement's
   * profile: present fairy slots with no certified physical path, and the
   * bat of a vanilla meter (plan-scope-flags.ts). Absent (the online flags)
   * means nothing is capacity-locked.
   */
  capacityLockedLocations?: ReadonlySet<LocationKey>;
  /**
   * A wish pond's vanilla slots generation locked at Vanilla grants, each to the
   * item her upgrade produces there (pond/pond-vanilla-slots.ts), so no override
   * is armed and the real upgrade runs. Absent (the online flags, and every
   * placement generated before the rule) locks nothing this way.
   */
  pondLockedItems?: ReadonlyMap<LocationKey, ItemKey>;
  /**
   * Locked spots of a Custom family: location → starting tier index, so a
   * polled "purchased" threshold is read past the tier a new file starts at.
   */
  /** Locked spot → the starting rung of its Custom family (0 = the empty tier). */
  capacityStartTiers?: ReadonlyMap<string, number>;
  /**
   * The shelf scope the placement was generated with. A placement from
   * before shops existed carries none, which reads as no slot open, so every
   * shop then behaves exactly as it does with the option off.
   */
  shops: ShopScope;
  /** What each shelf charges in this seed; empty means every shelf keeps its vanilla price. */
  shopPrices: ShopPriceView;
  /**
   * The pond's prize slots, in prize order, for a placement whose pond is part
   * of the shuffle. Absent (a legacy pond, and the online flags) means the two
   * reference slots are the capacity families' own spots, as they always were.
   */
  pondPrizeLocations?: readonly LocationKey[];
  /**
   * The numbered rungs of each wish pond whose plan carries them: location
   * to the water and the place in its sequence (wish-pond-rung-keys.ts).
   * Absent (both wish ponds legacy or at their native economy, and the online
   * flags) means no rung is a location.
   */
  wishPondRungs?: ReadonlyMap<LocationKey, WishPondRungKey>;
}

const isLockedVanilla = (location: LocationKey, flags: ScopeFlags): boolean =>
  (!flags.shufflePrizes && PRIZE_LOCATIONS.has(location))
  || (!flags.keyDropShuffle && KEY_DROP_LOCATIONS.has(location))
  || (!flags.includeNpcChecks && NPC_SCOPE_LOCATIONS.has(location))
  || (!flags.includeWorldItems && WORLD_ITEM_SCOPE_LOCATIONS.has(location))
  || flags.npcLockedLocations?.has(location) === true
  || flags.worldLockedLocations?.has(location) === true
  || flags.capacityLockedLocations?.has(location) === true
  || flags.pondLockedItems?.has(location) === true;

/** The capability-locked vanilla item a stale-placement check compares against. */
const capabilityVanillaItemOf = (location: LocationKey, flags: ScopeFlags): ItemKey | undefined => {
  if (!flags.shufflePrizes && PRIZE_LOCATIONS.has(location)) return VANILLA_PRIZES.get(location);
  // Checked before the npc remainder: the pond's own table names the item she produces.
  const pondItem = flags.pondLockedItems?.get(location);
  if (pondItem !== undefined) return pondItem;
  if (flags.npcLockedLocations?.has(location) === true) {
    return NPC_SCOPE_LOCATIONS.get(location);
  }
  if (flags.worldLockedLocations?.has(location) === true) {
    return WORLD_ITEM_SCOPE_LOCATIONS.get(location);
  }
  if (flags.capacityLockedLocations?.has(location) === true) {
    // The fairy slots carry their vanilla item in the capacity table; the bat is an npc-scope row.
    return CAPACITY_UPGRADE_LOCATIONS.get(location) ?? NPC_SCOPE_LOCATIONS.get(location);
  }
  return undefined;
};

export { capabilityVanillaItemOf, isLockedVanilla };
export type { ScopeFlags };
