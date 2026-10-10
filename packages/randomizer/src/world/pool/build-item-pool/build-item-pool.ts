/* @layer shared-game @kind logic */
import { applyProgressiveTicks } from '../../progressive/progressive-pool';
import { applyProgressiveModes } from '../../progressive/progressive-mode-pool';
import { progressiveModesOf, progressiveSettingOf } from '../../progressive/progressive-reach';
import { applyRetroBowPool, retroQuiverPoolItems } from '../../retro/retro-pool';
import { DEFAULT_DIFFICULTY } from '../../difficulty/difficulty';
import { applyCopyMultipliers } from '../../difficulty/difficulty-copies-pool';
import { applyHeartCap } from '../../difficulty/difficulty-hearts-pool';
import { CAPACITY_UPGRADE_LOCATIONS } from '../../scope-tables';
import { REFERENCE_CAPACITY_PROFILE } from '../../capacity/capacity-profile-defaults';
import { capacityPlansOf } from '../../capacity/family-plan';
import { spotOfFamily } from '../../capacity/capacity-spots';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '../../dungeon-items/dungeon-item-modes';
import { uncleWeaponUsableAtStart } from '../uncle-usability';
import { UNCLE_LOCATION } from '../standard-escape';
import { takeUncleWeapon } from '../uncle-weapon';
import { capacityPoolItems } from '../capacity-pool-items';
import { meterPoolItemsOf } from '../meter-pool-items-of';
import { balanceFiller } from '../balance-filler';
import { removeScopeLockedFromPool } from '../remove-scope-locked-from-pool';
import { removePondGrantsFromPool } from '../pond-grant-subtraction';
import { SHOP_BACKFILL_ITEM } from './build-item-pool.constants';
import { baselinePoolOf } from './baseline-pool-of';
import { classifiedPoolOf } from './classified-pool-of';
import { defaultLockedScope } from './default-locked-scope';
import { dungeonItemSetsOf } from './dungeon-item-sets-of';
import { openCapacitySpots } from './open-capacity-spots';
import { openShopSlots } from './open-shop-slots';
import type { LocationKey } from '../../location-key';
import { itemAt } from '../../../checked-access';
import type { World } from '../../world.type';
import type { ItemPool } from '../item-pool.type';
import type { BottlePicker, FillerPicker, WeaponPicker } from '../pool.type';

const firstBottle: BottlePicker = (choices) => itemAt(choices, 0);

const buildItemPool = (
  world: World, pickBottle: BottlePicker = firstBottle, lockedScopeLocations?: ReadonlySet<LocationKey>,
  lockedCapacityLocations: ReadonlySet<LocationKey> = new Set(CAPACITY_UPGRADE_LOCATIONS.keys()),
  pickWeapon?: WeaponPicker, pickFiller?: FillerPicker,
): ItemPool => {
  const { includeNpcChecks = true, capacity = REFERENCE_CAPACITY_PROFILE } = world.options;
  const { includeWorldItems = includeNpcChecks, capacityProgressive = false } = world.options;
  const { dungeonItems: dungeonItemSetting = DEFAULT_DUNGEON_ITEM_SETTING } = world.options;
  const { difficulty = DEFAULT_DIFFICULTY } = world.options;
  const lockedScope = lockedScopeLocations ?? defaultLockedScope(includeNpcChecks, includeWorldItems);
  const tiers = progressiveSettingOf(world);
  const modes = progressiveModesOf(world);
  const retro = world.options.retroBow;
  const plans = capacityPlansOf(capacity, capacityProgressive);
  const meterSpot = spotOfFamily('meter');
  const meter = meterPoolItemsOf(plans.meter.items, meterSpot !== undefined && lockedScope.has(meterSpot));
  const pool = baselinePoolOf(pickBottle, meter.magicRow);
  const upgrades = [...capacityPoolItems(plans, lockedCapacityLocations), ...meter.overflow];
  pool.push(...upgrades);
  removeScopeLockedFromPool(pool, lockedScope);
  const uncoveredGrants = removePondGrantsFromPool(pool, world.options.lockedPondGrants, lockedScope);
  applyProgressiveTicks(pool, tiers);
  applyProgressiveModes(pool, tiers, modes);
  if (retro !== undefined) applyRetroBowPool(pool, retro);
  applyHeartCap(pool, difficulty.heartCap);
  const extraCopies = applyCopyMultipliers(pool, modes, difficulty.copies);
  const pondSlots = (world.options.pondPairAsPrizes?.length ?? 0) + uncoveredGrants;
  balanceFiller(
    pool, upgrades.length - openCapacitySpots(world, lockedCapacityLocations) + extraCopies + pondSlots,
    pickFiller);
  const quivers = retroQuiverPoolItems(world.options.shops, retro);
  const backfills = Math.max(0, openShopSlots(world) - quivers.length);
  for (let index = 0; index < backfills; index += 1) pool.push(SHOP_BACKFILL_ITEM);
  pool.push(...quivers);
  const uncleWeapon = pickWeapon !== undefined && !lockedScope.has(UNCLE_LOCATION)
    ? takeUncleWeapon(pool, pickWeapon, uncleWeaponUsableAtStart(capacity, retro?.enabled === true))
    : undefined;
  const { dungeonItems, escaped } = dungeonItemSetsOf(world, lockedScope, dungeonItemSetting);
  pool.push(...escaped);
  return classifiedPoolOf(pool, capacity, dungeonItems, uncleWeapon);
};

export { buildItemPool };
