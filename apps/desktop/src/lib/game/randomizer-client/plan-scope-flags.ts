/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { familyById, startTierOf } from '@shared/randomizer/world/capacity';
import {
  familyOfSpot, lockedCapacitySpotsOf, spotOfFamily,
} from '@shared/randomizer/world/capacity/capacity-spots';
import {
  probeDeliverablePondLocations, undeliverableNpcLocations, undeliverableWorldLocations,
} from './npc-capability';
import type { PlacementStats } from '@shared/randomizer/world/fill/placement.type';
import type { CapacityProfile } from '@shared/randomizer/world/capacity';
import { POND_PRIZE_LOCATIONS } from '@shared/randomizer/world/pond/pond-rungs';
import { pondVanillaSlotsOf } from '@shared/randomizer/world/pond/pond-vanilla-slots';
import { wishPondRungKeysOf } from './wish-pond-rung-keys';
import type { ScopeFlags } from './scope-lock';

const capacityLockedSpotsOf = (profile: CapacityProfile): ReadonlySet<LocationKey> => {
  const locked = new Set(lockedCapacitySpotsOf(profile, probeDeliverablePondLocations()));
  const meterSpot = spotOfFamily('meter');
  if (profile.meter.mode === 'vanilla' && meterSpot !== undefined) locked.add(meterSpot);
  return locked;
};

const capacityStartTiersOf = (
  profile: CapacityProfile, locked: ReadonlySet<LocationKey>,
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

const scopeFlagsOfStats = (stats: PlacementStats): ScopeFlags => {
  const { includeWorldItems, capacity: profile, ponds } = stats;
  const pondOwnsSlots = ponds.capacity.mode !== 'capacity';
  const wishPondRungs = wishPondRungKeysOf(ponds);
  const pondSlots = pondVanillaSlotsOf(ponds, probeDeliverablePondLocations(), stats.pondSlotsFollowMode);
  const pondLocked = pondSlots.locked;
  const capacityLockedLocations = pondOwnsSlots ? new Set<LocationKey>() : capacityLockedSpotsOf(profile);
  return {
    keyDropShuffle: stats.keyDropShuffle,
    includeNpcChecks: stats.includeNpcChecks,
    includeWorldItems,
    shufflePrizes: stats.shufflePrizes,
    ...(stats.includeNpcChecks ? { npcLockedLocations: undeliverableNpcLocations() } : {}),
    ...(includeWorldItems ? { worldLockedLocations: undeliverableWorldLocations() } : {}),
    capacityLockedLocations,
    ...(pondLocked.size > 0 ? { pondLockedItems: pondLocked } : {}),
    ...(pondSlots.pairAsPrizes.length > 0 ? { pondPrizeSlots: new Set(pondSlots.pairAsPrizes) } : {}),
    capacityStartTiers: capacityStartTiersOf(profile, capacityLockedLocations),
    shops: stats.shops,
    shopPrices: {},
    ...(pondOwnsSlots
      ? { pondPrizeLocations: POND_PRIZE_LOCATIONS.slice(0, stats.pondPrizeCount) }
      : {}),
    ...(wishPondRungs.size > 0 ? { wishPondRungs } : {}),
  };
};

export { scopeFlagsOfStats };
