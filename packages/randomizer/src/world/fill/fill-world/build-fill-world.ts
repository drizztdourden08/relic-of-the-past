/* @layer shared-game @kind logic */
import { buildWorld } from '../../build-world';
import { registerRules } from '../../rules/register';
import { buildItemPool } from '../../pool/build-item-pool';
import { UNCLE_LOCATION } from '../../pool/standard-escape';
import { REFERENCE_CAPACITY_PROFILE } from '../../capacity/capacity-profile-defaults';
import { REFERENCE_CAPACITY_BONUS } from '../../capacity/bonus/capacity-bonus.constants';
import { lockedCapacitySpotsOf } from '../../capacity/capacity-spots';
import { capacityPoolCountsOf } from '../../capacity/family-plan';
import { CAPACITY_POND } from '../../pond/pond-instances';
import { LEGACY_POND_PROFILES } from '../../pond/pond-profile-defaults';
import { REFERENCE_DARK_ROOM_SETTING } from '../../dark-rooms/dark-room-lights.constants';
import { DEFAULT_STORY_GATES } from '../../story-gates/story-gates.constants';
import { DEFAULT_PROGRESSIVE_SETTING } from '../../progressive/progressive-families.constants';
import { DEFAULT_DIFFICULTY } from '../../difficulty/difficulty';
import { DEFAULT_PROGRESSIVE_MODES } from '../../progressive/progressive-modes';
import { DEFAULT_RETRO_BOW } from '../../retro/retro-bow.constants';
import { DEFAULT_ITEM_POWER } from '../../item-power/item-power.constants';
import { DEFAULT_ACCESSIBILITY } from '../../accessibility/accessibility-from-snapshot';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '../../dungeon-items/dungeon-item-modes';
import { pondPrizeLocations, presentPondSlots } from '../../pond/pond-spots';
import { pondVanillaSlotsOf } from '../../pond/pond-vanilla-slots';
import { NO_SHOP_SCOPE } from '../../shops/shop-scope-from-values';
import { NO_SHOP_PRICES } from '../fill.constants';
import { checkSpotCount } from './check-spot-count';
import { dungeonOwnershipOf } from './dungeon-ownership-of';
import { lockedScopeLocationsOf } from './locked-scope-locations-of';
import { lockedVanillaOf } from './locked-vanilla-of';
import { pruneAlwaysAllow } from './prune-always-allow';
import type { LocationKey } from '../../location-key';
import type { World } from '../../world.type';
import type { FillWorld, FillWorldOptions } from '../fill-world.type';

const buildFillWorld = (options: FillWorldOptions): FillWorld => {
  const {
    keyDropShuffle, includeNpcChecks = true, includeWorldItems = includeNpcChecks,
    deliverableNpcLocations, deliverableWorldLocations,
    capacity = REFERENCE_CAPACITY_PROFILE, capacityProgressive = false, capacityBonus = REFERENCE_CAPACITY_BONUS,
    deliverableCapacityLocations, medallions,
    shops = NO_SHOP_SCOPE, shopPrices = NO_SHOP_PRICES, ponds = LEGACY_POND_PROFILES, pondDemands,
    pondSlotsFollowMode = false,
    darkRooms = REFERENCE_DARK_ROOM_SETTING, unlitEscapeExempt, storyGates = DEFAULT_STORY_GATES, actTokens,
    progressiveTiers = DEFAULT_PROGRESSIVE_SETTING, progressiveModes = DEFAULT_PROGRESSIVE_MODES,
    itemPower = DEFAULT_ITEM_POWER, retroBow = DEFAULT_RETRO_BOW,
    dungeonItems = DEFAULT_DUNGEON_ITEM_SETTING, accessibility = DEFAULT_ACCESSIBILITY,
    difficulty = DEFAULT_DIFFICULTY,
    pickBottle, pickWeapon, pickFiller,
  } = options;
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
  const lockedScope = lockedScopeLocationsOf(
    includeNpcChecks, includeWorldItems, capacity, deliverableNpcLocations, deliverableWorldLocations, pondSlots);
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
  const pool = buildItemPool(poolView, pickBottle, lockedScope, lockedCapacity, pickWeapon, pickFiller);
  const lockedVanilla = lockedVanillaOf(world, keyDropShuffle, lockedScope, pondSlots.locked, lockedCapacity);
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
