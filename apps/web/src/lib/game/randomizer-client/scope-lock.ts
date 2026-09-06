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

import { KEY_DROP_LOCATIONS, CAPACITY_UPGRADE_LOCATIONS, PRIZE_LOCATIONS } from '@shared/randomizer/ap-world/special-locations.data';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '@shared/randomizer/ap-world/scope-vanilla.data';
import { VANILLA_PRIZES } from '@shared/randomizer/ap-world/vanilla-prizes.data';
import type { ShopScope } from '@shared/randomizer/ap-world/shops/shop-scope.type';
import type { ShopPriceView } from '@shared/randomizer/ap-world/shops/shop-price.type';

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
  npcLockedLocations?: ReadonlySet<string>;
  /** World-item option ON only: same mechanism over the world-item table. */
  worldLockedLocations?: ReadonlySet<string>;
  /**
   * The capacity spots generation keeps vanilla under the placement's
   * profile: present fairy slots with no certified physical path, and the
   * bat of a vanilla meter (plan-scope-flags.ts). Absent (the online flags)
   * means nothing is capacity-locked.
   */
  capacityLockedLocations?: ReadonlySet<string>;
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
  pondPrizeLocations?: readonly string[];
}

const isLockedVanilla = (locationName: string, flags: ScopeFlags): boolean =>
  (!flags.shufflePrizes && PRIZE_LOCATIONS.has(locationName))
  || (!flags.keyDropShuffle && KEY_DROP_LOCATIONS.has(locationName))
  || (!flags.includeNpcChecks && NPC_SCOPE_LOCATIONS.has(locationName))
  || (!flags.includeWorldItems && WORLD_ITEM_SCOPE_LOCATIONS.has(locationName))
  || flags.npcLockedLocations?.has(locationName) === true
  || flags.worldLockedLocations?.has(locationName) === true
  || flags.capacityLockedLocations?.has(locationName) === true;

/** The capability-locked vanilla item a stale-placement check compares against. */
const capabilityVanillaItemOf = (locationName: string, flags: ScopeFlags): string | undefined => {
  if (!flags.shufflePrizes && PRIZE_LOCATIONS.has(locationName)) return VANILLA_PRIZES.get(locationName);
  if (flags.npcLockedLocations?.has(locationName) === true) {
    return NPC_SCOPE_LOCATIONS.get(locationName);
  }
  if (flags.worldLockedLocations?.has(locationName) === true) {
    return WORLD_ITEM_SCOPE_LOCATIONS.get(locationName);
  }
  if (flags.capacityLockedLocations?.has(locationName) === true) {
    // The fairy slots carry their vanilla item in the capacity table; the bat is an npc-scope row.
    return CAPACITY_UPGRADE_LOCATIONS.get(locationName) ?? NPC_SCOPE_LOCATIONS.get(locationName);
  }
  return undefined;
};

export { capabilityVanillaItemOf, isLockedVanilla };
export type { ScopeFlags };
