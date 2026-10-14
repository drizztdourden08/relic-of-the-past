/* @layer shared-game @kind logic */
import { applyProgressiveTicks } from '../../progressive/progressive-pool';
import { applyProgressiveModes } from '../../progressive/progressive-mode-pool';
import { progressiveModesOf, progressiveSettingOf } from '../../progressive/progressive-reach';
import { applyRetroBowPool } from '../../retro/retro-pool';
import { applyCopyMultipliers } from '../../difficulty/difficulty-copies-pool';
import { applyHeartCap } from '../../difficulty/difficulty-hearts-pool';
import { CAPACITY_UPGRADE_LOCATIONS } from '../../scope-tables';
import { capacityPlansOf } from '../../capacity/family-plan';
import { capacityPoolItems } from '../capacity-pool-items';
import { meterPoolItemsOf } from '../meter-pool-items-of';
import { balanceFiller } from '../balance-filler';
import { removeScopeLockedFromPool } from '../remove-scope-locked-from-pool';
import { removePondGrantsFromPool } from '../pond-grant-subtraction';
import { addShopBackfill } from './add-shop-backfill';
import { baselinePoolOf } from './baseline-pool-of';
import { classifiedPoolOf } from './classified-pool-of';
import { defaultLockedScope } from './default-locked-scope';
import { dungeonItemSetsOf } from './dungeon-item-sets-of';
import { isMeterLocked } from './is-meter-locked';
import { openCapacitySpots } from './open-capacity-spots';
import { poolSettingsOf } from './pool-settings-of';
import { takeUncleForPool } from './take-uncle-for-pool';
import { itemAt } from '../../../checked-access';
import type { World } from '../../world.type';
import type { ItemPool } from '../item-pool.type';
import type { BottlePicker } from '../pool.type';
import type { PoolLocks, PoolPickers } from './build-item-pool.type';

const firstBottle: BottlePicker = (choices) => itemAt(choices, 0);

const buildItemPool = (world: World, locks: PoolLocks = {}, pickers: PoolPickers = {}): ItemPool => {
  const { pickBottle = firstBottle, pickWeapon, pickFiller } = pickers;
  const { includeNpcChecks, includeWorldItems, capacity, capacityProgressive, dungeonItemSetting, difficulty } =
    poolSettingsOf(world);
  const lockedScope = locks.scope ?? defaultLockedScope(includeNpcChecks, includeWorldItems);
  const lockedCapacityLocations = locks.capacity ?? new Set(CAPACITY_UPGRADE_LOCATIONS.keys());
  const tiers = progressiveSettingOf(world);
  const modes = progressiveModesOf(world);
  const retro = world.options.retroBow;
  const plans = capacityPlansOf(capacity, capacityProgressive);
  const meter = meterPoolItemsOf(plans.meter.items, isMeterLocked(lockedScope));
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
  addShopBackfill(pool, world, retro);
  const uncleWeapon = takeUncleForPool(pool, { pickWeapon, lockedScope, capacity, retro });
  const { dungeonItems, escaped } = dungeonItemSetsOf(world, lockedScope, dungeonItemSetting);
  pool.push(...escaped);
  return classifiedPoolOf(pool, capacity, dungeonItems, uncleWeapon);
};

export { buildItemPool };
