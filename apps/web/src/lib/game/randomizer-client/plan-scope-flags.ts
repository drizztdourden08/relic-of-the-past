/* @layer bridge-wasm @kind logic */
/**
 * The scope flags of a persisted placement: what generation locked, derived
 * again from the same stats so the bridge and the fill always name the same
 * rows. Option toggles lock whole scope tables; a toggle on locks the
 * capability probe's undeliverable remainder. The capacity spots follow the
 * profile the placement was generated with (capacityProfileOfStats: a
 * placement from before the profile existed maps through the legacy shape):
 * a present fairy slot not proven deliverable stays vanilla, and a vanilla
 * meter locks the bat explicitly, exactly as fill-world.ts does. A Custom
 * family with a locked spot also hands the poller its starting rung (0 is
 * the empty tier), so the pond's "purchased" compare keeps meaning "advanced
 * by one purchase".
 */

import { capacityProfileOfStats } from '@shared/randomizer/ap-world/fill/placement-capacity';
import { familyById, startTierOf } from '@shared/randomizer/ap-world/capacity';
import {
  familyOfSpot, lockedCapacitySpotsOf, spotOfFamily,
} from '@shared/randomizer/ap-world/capacity/capacity-spots';
import {
  probeDeliverableCapacityLocations, undeliverableNpcLocations, undeliverableWorldLocations,
} from './npc-capability';
import type { ApPlacementStats } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import { POND_PRIZE_LOCATIONS } from '@shared/randomizer/ap-world/pond/pond-locations.data';
import { NO_SHOP_SCOPE } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import type { ScopeFlags } from './scope-lock';



/** The capacity spots this profile keeps vanilla: undeliverable fairy slots, plus the bat of a vanilla meter. */
const capacityLockedSpotsOf = (profile: CapacityProfile): ReadonlySet<string> => {
  const locked = new Set(lockedCapacitySpotsOf(profile, probeDeliverableCapacityLocations()));
  const meterSpot = spotOfFamily('meter');
  if (profile.meter.mode === 'vanilla' && meterSpot !== undefined) locked.add(meterSpot);
  return locked;
};

/** location → starting rung, for the locked spots of a Custom family (rung 0 included; other modes omitted). */
const capacityStartTiersOf = (
  profile: CapacityProfile, locked: ReadonlySet<string>,
): ReadonlyMap<string, number> => {
  const tiers = new Map<string, number>();
  for (const location of locked) {
    const family = familyOfSpot(location);
    if (family === undefined) continue;
    const setting = profile[family];
    if (setting.mode === 'custom') tiers.set(location, startTierOf(familyById(family), setting));
  }
  return tiers;
};

const scopeFlagsOfStats = (stats: ApPlacementStats): ScopeFlags => {
  const includeWorldItems = stats.includeWorldItems ?? stats.includeNpcChecks;
  const profile = capacityProfileOfStats(stats);
  // A non-legacy pond owns its prize slots outright: they are proven deliverable
  // at generation or they are not locations at all, so nothing of the pond is
  // ever capability-locked here.
  const pondOwnsSlots = stats.pond !== undefined && stats.pond.mode !== 'capacity';
  const capacityLockedLocations = pondOwnsSlots ? new Set<string>() : capacityLockedSpotsOf(profile);
  return {
    keyDropShuffle: stats.keyDropShuffle,
    includeNpcChecks: stats.includeNpcChecks,
    includeWorldItems,
    // Absent on a placement generated before the option existed: those hold the
    // vanilla prizes and must keep every prize slot locked.
    shufflePrizes: stats.shufflePrizes === true,
    // A toggle on: generation locked the undeliverable scope remainder;
    // classify with the same probe so both sides always name the same rows.
    ...(stats.includeNpcChecks ? { npcLockedLocations: undeliverableNpcLocations() } : {}),
    ...(includeWorldItems ? { worldLockedLocations: undeliverableWorldLocations() } : {}),
    capacityLockedLocations,
    capacityStartTiers: capacityStartTiersOf(profile, capacityLockedLocations),
    // A placement frozen before shops existed opened no shelf.
    shops: stats.shops ?? NO_SHOP_SCOPE,
    // The rolled prices live on the placement, not its stats; the plan builder merges them in.
    shopPrices: {},
    // A placement frozen before the pond option, or one that kept the legacy
    // pond, carries no prize slots at all: its two pond names stay the capacity
    // families' spots and every classification below is the one it always was.
    ...(stats.pond !== undefined && stats.pond.mode !== 'capacity'
      ? { pondPrizeLocations: POND_PRIZE_LOCATIONS.slice(0, stats.pondPrizeCount ?? 0) }
      : {}),
  };
};

export { capacityLockedSpotsOf, scopeFlagsOfStats };
