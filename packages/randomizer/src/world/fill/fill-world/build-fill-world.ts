/* @layer shared-game @kind logic */
import { buildWorld } from '../../build-world';
import { registerRules } from '../../rules/register';
import { buildItemPool } from '../../pool/build-item-pool';
import { UNCLE_LOCATION } from '../../pool/standard-escape';
import { lockedCapacitySpotsOf } from '../../capacity/capacity-spots';
import { capacityPoolCountsOf } from '../../capacity/family-plan';
import { CAPACITY_POND } from '../../pond/pond-instances';
import { pondPrizeLocations, presentPondSlots } from '../../pond/pond-spots';
import { pondVanillaSlotsOf } from '../../pond/pond-vanilla-slots';
import { checkSpotCount } from './check-spot-count';
import { resolveFillDefaults } from './defaults/resolve-fill-defaults';
import { dungeonOwnershipOf } from './dungeon-ownership-of';
import { lockedScopeLocationsOf } from './locked-scope-locations-of';
import { lockedVanillaOf } from './locked-vanilla-of';
import { pruneAlwaysAllow } from './prune-always-allow';
import type { LocationKey } from '../../location-key';
import type { World } from '../../world.type';
import type { FillWorld, FillWorldOptions } from '../fill-world.type';

const buildFillWorld = (options: FillWorldOptions): FillWorld => {
  const {
    keyDropShuffle, deliverableNpcLocations, deliverableWorldLocations, deliverableCapacityLocations, medallions,
    pondDemands, unlitEscapeExempt, actTokens, pickBottle, pickWeapon, pickFiller,
  } = options;
  const {
    includeNpcChecks, includeWorldItems, capacity, capacityProgressive, capacityBonus,
    shops, shopPrices, ponds, pondSlotsFollowMode, darkRooms, storyGates,
    progressiveTiers, progressiveModes, itemPower, retroBow, dungeonItems, accessibility, difficulty,
  } = resolveFillDefaults(options);
  const pondSlotLocations = presentPondSlots(ponds, capacity, deliverableCapacityLocations);
  const pondLocations = pondPrizeLocations(ponds, capacity, deliverableCapacityLocations);
  const pondSlots = pondVanillaSlotsOf(ponds, deliverableCapacityLocations, pondSlotsFollowMode);
  const world = buildWorld({
    keyDropShuffle: true, capacity, medallions, shops, shopPrices, ponds, darkRooms, unlitEscapeExempt,
    storyGates,
    ...(actTokens === undefined ? {} : { actTokens }),
    progressiveTiers, progressiveModes, itemPower, retroBow, dungeonItems, accessibility,
    ...(pondDemands === undefined ? {} : { pondDemands }),
    pondLocations: pondSlotLocations,
    pondPrizeLocations: pondLocations,
    ...(pondSlots.pairAsPrizes.length === 0 ? {} : { pondPairAsPrizes: pondSlots.pairAsPrizes }),
    ...(pondSlots.locked.size === 0 ? {} : { lockedPondGrants: pondSlots.locked }),
  });
  registerRules(world);
  pruneAlwaysAllow(world, accessibility);
  const lockedScope = lockedScopeLocationsOf({
    includeNpcChecks, includeWorldItems, capacity, deliverableNpcLocations, deliverableWorldLocations, pondSlots,
  });
  const lockedCapacity = ponds[CAPACITY_POND.id].mode === 'capacity'
    ? lockedCapacitySpotsOf(capacity, deliverableCapacityLocations)
    : new Set<LocationKey>();
  const poolView: World = {
    ...world,
    options: {
      ...world.options, keyDropShuffle, includeNpcChecks, includeWorldItems, capacity, capacityProgressive,
      shops, ponds, progressiveTiers, progressiveModes, itemPower, retroBow,
      dungeonItems, accessibility, difficulty,
    },
  };
  const pool = buildItemPool(poolView, { scope: lockedScope, capacity: lockedCapacity }, {
    pickBottle, pickWeapon, pickFiller,
  });
  const lockedVanilla = lockedVanillaOf({
    world, keyDropShuffle, lockedScope, lockedPondGrants: pondSlots.locked, lockedCapacity,
  });
  for (const [location, item] of lockedVanilla) world.placedItems.set(location, item);
  if (pool.uncleWeapon !== undefined) world.placedItems.set(UNCLE_LOCATION, pool.uncleWeapon);
  const { locationDungeon, itemDungeon } = dungeonOwnershipOf(world);
  return {
    world, keyDropShuffle, includeNpcChecks, includeWorldItems, capacity, capacityProgressive, capacityBonus,
    shops, shopPrices,
    ponds, pondSlotsFollowMode, pondLocations, darkRooms, storyGates, progressiveTiers, progressiveModes, itemPower, retroBow,
    dungeonItems, accessibility, difficulty,
    capacityCounts: capacityPoolCountsOf(
      capacity, checkSpotCount(capacity, pondLocations, lockedCapacity, lockedScope)),
    pool, lockedVanilla, locationDungeon, itemDungeon,
  };
};

export { buildFillWorld };
