/* @layer shared-game @kind logic */
/**
 * Assembles the baseline item pool from the transcribed composition rows —
 * the port of Archipelago worlds/alttp/ItemPool.py get_pool_core +
 * generate_itempool for the fixed baseline options (normal pool, standard
 * mode, boss-defeat goal, no timer, progressive on, retro off, shops off).
 * Dungeon-restricted items never enter the global pool: under the baseline
 * shuffle options every key/big-key/map/compass is dungeon-local and
 * pre-filled inside its dungeon. With the key-drop option OFF the reference
 * locks each drop location's vanilla key onto it and removes it from the
 * dungeon set (generate_itempool lines 350-370) — mirrored here by
 * subtracting the drop table's items per dungeon. The synthetic npc-scope
 * option reuses the same arithmetic per LOCKED LOCATION: each locked
 * location's vanilla item leaves the global pool — in-dungeon standing keys
 * leave their dungeon sets instead (scope-subtraction.ts). The capacity
 * profile adds its families' upgrade items (capacity-pool-items.ts — the
 * meter's first items take the reference's magic row, the rest join the
 * other families' items) and trims one filler per item past the spots that
 * became checks (balance-filler.ts), keeping the fill one item per open
 * location. The profile also decides which starting weapons are usable at
 * the escape (uncle-usability.ts) and whether the wallet items count as
 * progression (progression-class.ts).
 */
import {
  ALWAYS_ITEMS, ARMOR_ITEMS, BASE_ITEMS, BOTTLE_COUNT, BOW_ITEMS, EXTRA_ITEMS,
  GLOVE_ITEMS, LEGACY_INSANITY_ITEMS, SHIELD_ITEMS, SWORD_ITEMS,
  TOTAL_ITEMS_TO_PLACE,
} from './pool-tables.data';
import { applyProgressiveTicks } from '../progressive/progressive-pool';
import { applyProgressiveModes } from '../progressive/progressive-mode-pool';
import { progressiveModesOf, progressiveSettingOf } from '../progressive/progressive-reach';
import { applyRetroBowPool, retroQuiverPoolItems } from '../retro/retro-pool';
import { DEFAULT_DIFFICULTY } from '../difficulty/difficulty.data';
import { applyCopyMultipliers } from '../difficulty/difficulty-copies-pool';
import { applyHeartCap } from '../difficulty/difficulty-hearts-pool';
import { USEFUL_ITEMS } from './item-classes.data';
import { isProgressionUnder } from './progression-class';
import { uncleWeaponUsableAtStart } from './uncle-usability';
import { EVENT_ITEMS, PRIZE_ITEMS } from './event-items.data';
import { BOTTLE_ITEMS } from '../item-names.data';
import { CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS } from '../special-locations.data';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-vanilla.data';
import { isShopSlotLocation } from '../shops/shop-slots';
import { REFERENCE_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import { capacityPlansOf } from '../capacity/family-plan';
import { spotOfFamily } from '../capacity/capacity-spots';
import { capacityPoolItems, meterPoolItemsOf } from './capacity-pool-items';
import { balanceFiller } from './balance-filler';
import { removeScopeLockedFromPool, scopeLockedKeyCounts } from './scope-subtraction';
import {
  DEFAULT_DUNGEON_ITEM_SETTING, modeOfDungeonItem, staysInDungeons,
} from '../dungeon-items/dungeon-item-modes';
import { UNCLE_LOCATION } from './standard-escape.data';
import { takeUncleWeapon } from './uncle-weapon';
import type { FillerPicker } from './balance-filler';
import type { WeaponPicker } from './uncle-weapon';
import type { DungeonItemSetting } from '../dungeon-items/dungeon-item.type';
import type { ApDungeonDef } from '../region.type';
import type { ApWorld } from '../world.type';
import type { ApItemPool } from './item-pool.type';

type BottlePicker = (choices: readonly string[]) => string;

/** Deterministic default: the reference randomizes contents, logic does not care. */
const firstBottle: BottlePicker = (choices) => choices[0];

/** How many of this dungeon's restricted items sit locked on drop locations. */
const lockedDropCounts = (dungeon: ApDungeonDef): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const item of KEY_DROP_LOCATIONS.values()) {
    if (item === dungeon.smallKey || item === dungeon.bigKey) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return counts;
};

const removeCounted = (items: string[], counts: ReadonlyMap<string, number>, table: string): void => {
  for (const [item, count] of counts) {
    for (let index = 0; index < count; index += 1) {
      const position = items.indexOf(item);
      if (position === -1) throw new Error(`${table} exceeds dungeon items: ${item}`);
      items.splice(position, 1);
    }
  }
};

const dungeonItemsOf = (
  dungeon: ApDungeonDef, keyDropShuffle: boolean, lockedScopeLocations: ReadonlySet<string>,
): string[] => {
  const items: string[] = Array<string>(dungeon.smallKeyCount).fill(dungeon.smallKey);
  if (dungeon.bigKey !== null) items.push(dungeon.bigKey);
  if (dungeon.map !== null) items.push(dungeon.map);
  if (dungeon.compass !== null) items.push(dungeon.compass);
  if (!keyDropShuffle) removeCounted(items, lockedDropCounts(dungeon), 'drop table');
  removeCounted(items, scopeLockedKeyCounts([dungeon.smallKey], lockedScopeLocations), 'npc-scope table');
  return items;
};

/**
 * ItemPool.py 347-348: only the families still named in dungeon_local_item_names
 * stay out of the global pool. A family whose mode has left the dungeons goes
 * into `escaped`, joins the shuffled pool, and stops being prefilled — which
 * frees exactly one dungeon location per item, so the fill stays balanced with
 * no filler arithmetic. Under the baseline every family stays in, `escaped` is
 * empty and the pool is byte-identical to what it always was.
 */
const partitionDungeonItems = (
  items: readonly string[], setting: DungeonItemSetting, escaped: string[],
): string[] => {
  const kept: string[] = [];
  for (const item of items) {
    if (staysInDungeons(modeOfDungeonItem(setting, item))) kept.push(item);
    else escaped.push(item);
  }
  return kept;
};

/**
 * Which scope locations stay vanilla when the caller supplies no explicit set:
 * a table's toggle off locks that whole table, on locks nothing of it (the
 * historical all-or-nothing behavior every existing caller relies on).
 */
const defaultLockedScope = (includeNpcChecks: boolean, includeWorldItems: boolean): ReadonlySet<string> => {
  const locked = new Set<string>();
  if (!includeNpcChecks) for (const name of NPC_SCOPE_LOCATIONS.keys()) locked.add(name);
  if (!includeWorldItems) for (const name of WORLD_ITEM_SCOPE_LOCATIONS.keys()) locked.add(name);
  return locked;
};

/** What the reference puts in the pool for a freed shop slot (ItemPool.py 405-410). */
const SHOP_BACKFILL_ITEM = 'Rupees (50)';

/**
 * Shelf slots that are locations in this world and free for the fill: one
 * pool item each. A retro seed opens the shelf that sold arrows along with
 * them (retro/retro-shops.ts) and locks nothing, so every one of them counts.
 */
const openShopSlots = (world: ApWorld): number =>
  [...world.locationsByName.keys()].filter((name) => isShopSlotLocation(name)).length;

/**
 * Pond prize slots that are checks in this world: present and not locked.
 * Under the legacy pond those are exactly the present fairy slots, so this is
 * the count the balance has always used; a non-legacy pond adds its own prize
 * slots here and each one displaces a filler back into the pool.
 */
const openCapacitySpots = (world: ApWorld, lockedCapacityLocations: ReadonlySet<string>): number =>
  [...world.locationsByName.values()]
    .filter((location) => location.pondSlot && !lockedCapacityLocations.has(location.name)).length;

const buildItemPool = (
  world: ApWorld, pickBottle: BottlePicker = firstBottle, lockedScopeLocations?: ReadonlySet<string>,
  lockedCapacityLocations: ReadonlySet<string> = new Set(CAPACITY_UPGRADE_LOCATIONS.keys()),
  pickWeapon?: WeaponPicker, pickFiller?: FillerPicker,
): ApItemPool => {
  const { keyDropShuffle, includeNpcChecks = true, capacity = REFERENCE_CAPACITY_PROFILE } = world.options;
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
  const pool: string[] = [
    ...ALWAYS_ITEMS,
    ...GLOVE_ITEMS,
    ...LEGACY_INSANITY_ITEMS,
    ...BASE_ITEMS,
  ];
  for (let index = 0; index < BOTTLE_COUNT; index += 1) pool.push(pickBottle(BOTTLE_ITEMS));
  pool.push(...SHIELD_ITEMS, ...ARMOR_ITEMS, ...meter.magicRow, ...BOW_ITEMS, ...SWORD_ITEMS, ...EXTRA_ITEMS);
  if (pool.length !== TOTAL_ITEMS_TO_PLACE) {
    throw new Error(`pool size ${pool.length} != ${TOTAL_ITEMS_TO_PLACE}`);
  }
  const upgrades = [...capacityPoolItems(plans, lockedCapacityLocations), ...meter.overflow];
  pool.push(...upgrades);
  removeScopeLockedFromPool(pool, lockedScope);
  // After the subtraction, never before: a tick may only remove a copy the
  // shuffle was really going to carry (progressive/progressive-pool.ts).
  applyProgressiveTicks(pool, tiers);
  // Then the per-family mode, on the copies that survived: a random-order
  // family's copies stop being steps and become the rungs themselves
  // (progressive/progressive-mode-pool.ts). One name for one name, so the
  // size the tick pass preserved is preserved again.
  applyProgressiveModes(pool, tiers, modes);
  // And retro, on the same terms: an arrow pickup the shuffle carries becomes
  // a small rupee pickup, because a retro seed has no ammunition to find.
  if (retro !== undefined) applyRetroBowPool(pool, retro);
  // The ceiling on the hearts, on the same terms as an unticked rung: a pickup
  // the seed no longer carries becomes the stand-in rupee pickup, so the size
  // does not move (difficulty/difficulty-hearts-pool.ts).
  applyHeartCap(pool, difficulty.heartCap);
  // Then the copy multiples, LAST of the three passes over a tiered family, so
  // they multiply the names the ticks and the order pass have already settled
  // (difficulty/difficulty-copies-pool.ts). This one grows the pool, so its
  // count joins the capacity upgrades' filler arithmetic below rather than
  // getting one of its own.
  const extraCopies = applyCopyMultipliers(pool, modes, difficulty.copies);
  balanceFiller(
    pool, upgrades.length - openCapacitySpots(world, lockedCapacityLocations) + extraCopies, pickFiller);
  // A shelf slot the profile opened is one more spot, so the pool gains one
  // more item for it. The reference backfills a freed slot with rupees
  // rather than putting the shop's own stock in the pool (ItemPool.py
  // 399-411, beemizer off and the 100-rupee roll's chance at zero under
  // these options), and each restock is one more spot on the same terms.
  //
  // A retro seed with shuffled shops spends ONE of those backfills on the
  // quiver instead (retro/retro-pool.ts): the shelf that used to be stocked
  // with it opens as an ordinary slot in the same breath, so the seed gains a
  // spot and an item together and the balance never moves.
  const quivers = retroQuiverPoolItems(world.options.shops, retro);
  const backfills = Math.max(0, openShopSlots(world) - quivers.length);
  for (let index = 0; index < backfills; index += 1) pool.push(SHOP_BACKFILL_ITEM);
  pool.push(...quivers);

  // ItemPool.py 294-318, standard mode: assure the mentor check a usable
  // weapon. Skipped when that check is pre-placed (scope-locked to its
  // vanilla sword — the source's placed_items guard) or when the caller
  // supplies no picker (parity worlds load a finished placement instead).
  const uncleWeapon = pickWeapon !== undefined && !lockedScope.has(UNCLE_LOCATION)
    ? takeUncleWeapon(pool, pickWeapon, uncleWeaponUsableAtStart(capacity, retro?.enabled === true))
    : undefined;

  // Appended LAST, after every pass that reshapes the pool (the scope
  // subtraction, the tier ticks, the filler balance, the shop backfill and the
  // starting-weapon draw), so a family leaving its dungeons cannot perturb any
  // of them — the baseline pool is the same array it has always been, with
  // nothing after it.
  const dungeonItems = new Map<string, readonly string[]>();
  const escaped: string[] = [];
  for (const dungeon of world.dungeons.values()) {
    const items = dungeonItemsOf(dungeon, keyDropShuffle, lockedScope);
    dungeonItems.set(dungeon.name, partitionDungeonItems(items, dungeonItemSetting, escaped));
  }
  pool.push(...escaped);

  const isProgression = isProgressionUnder(capacity);
  const progression = pool.filter(isProgression);
  const useful = pool.filter((name) => USEFUL_ITEMS.has(name));
  const filler = pool.filter((name) => !isProgression(name) && !USEFUL_ITEMS.has(name));

  return {
    pool,
    progression,
    useful,
    filler,
    ...(uncleWeapon !== undefined ? { uncleWeapon } : {}),
    promotedHeartContainers: 1,
    dungeonItems,
    prizes: PRIZE_ITEMS,
    eventItems: EVENT_ITEMS,
    startInventory: [],
  };
};

export { buildItemPool };
export type { BottlePicker };
