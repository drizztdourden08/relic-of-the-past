/* @layer shared-game @kind logic */
/**
 * Fill-facing world constructor. Always builds the FULL graph (drop locations
 * included) so rules and accessibility see every location in both key-drop
 * modes, mirroring the reference where the option only decides whether the
 * drop locations are fillable or locked to their vanilla keys (ItemPool.py
 * 349-369). Also prunes the always-allow registry to the rows the reference
 * installs under full accessibility, and pre-places the locked content the
 * fill must never touch: event items, (key drops off) the vanilla drop keys,
 * the locked npc-scope locations' vanilla items (the whole scope table with
 * the option off, the physically undeliverable remainder with it on), a
 * wish pond's own pair at Vanilla grants (what her upgrade produces), and the
 * capacity spots the profile locks: a vanilla meter's giver, and every present
 * fairy slot not proven deliverable.
 *
 * The rolled shelf prices are handed STRAIGHT THROUGH to the graph builder,
 * because the access rules read them back off world.options (rules/prices.ts).
 * Keeping them here priced every shelf at its vanilla rupees in logic while
 * the running game charged the rolled price, which shipped seeds whose one
 * bomb bag stood behind a five-bomb shelf (issue #219).
 */
import { buildWorld } from '../build-world';
import { registerRules } from '../rules/register';
import { buildItemPool } from '../pool/build-item-pool';
import { UNCLE_LOCATION } from '../pool/standard-escape.data';
import { FULL_ACCESS_ALWAYS_ALLOW } from '../rules/tables/item-rules.data';
import { KEY_DROP_LOCATIONS, CAPACITY_UPGRADE_LOCATIONS } from '../special-locations.data';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-vanilla.data';
import { REFERENCE_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import { LEGACY_CAPACITY_BONUS } from '../capacity/bonus/capacity-bonus.data';
import { lockedCapacitySpotsOf, spotOfFamily } from '../capacity/capacity-spots';
import { capacityPoolCountsOf } from '../capacity/family-plan';
import { CAPACITY_POND, POND_INSTANCES } from '../pond/pond-instances.data';
import { LEGACY_POND_PROFILES } from '../pond/pond-profile-defaults';
import { REFERENCE_DARK_ROOM_SETTING } from '../dark-rooms/dark-room-lights.data';
import { DEFAULT_PROGRESSIVE_SETTING } from '../progressive/progressive-families.data';
import { DEFAULT_DIFFICULTY } from '../difficulty/difficulty.data';
import { DEFAULT_PROGRESSIVE_MODES } from '../progressive/progressive-modes.data';
import { DEFAULT_RETRO_BOW } from '../retro/retro-bow.data';
import { DEFAULT_ITEM_POWER } from '../item-power/item-power.data';
import { DEFAULT_ACCESSIBILITY } from '../accessibility/accessibility-from-snapshot';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '../dungeon-items/dungeon-item-modes';
import { presentPondLocations } from '../pond/pond-spots';
import { NO_SLOT_RULE, pondVanillaSlotsOf } from '../pond/pond-vanilla-slots';
import type { PondVanillaSlots } from '../pond/pond-vanilla-slots';
import type { ApWorld } from '../world.type';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { FillWorld, FillWorldOptions } from './fill-world.type';
import { NO_SHOP_SCOPE } from '../shops/shop-scope-from-values';
import type { ShopPriceView } from '../shops/shop-price.type';


/** Nothing rolled: every shelf charges the rupees the unmodified game charges. */
const NO_SHOP_PRICES: ShopPriceView = {};

/**
 * One scope table's locked subset: the whole table with its toggle off, the
 * remainder outside the caller's deliverable set with it on, because items must
 * never be shuffled onto a location the app cannot physically grant them
 * from. On mode with NO set keeps the fully-shuffleable world the parity
 * oracles pin.
 */
const lockedTableSubset = (
  table: ReadonlyMap<string, string>, include: boolean,
  deliverable: ReadonlySet<string> | undefined, into: Set<string>,
): void => {
  for (const name of table.keys()) {
    if (!include || (deliverable !== undefined && !deliverable.has(name))) into.add(name);
  }
};

/**
 * The scope locations this fill locks to their vanilla items: both tables and a
 * vanilla meter's giver. A wish-pond slot its mode decides is left out: a locked
 * one holds what her upgrade produces (a separate table), and a closed one is no
 * location, so its item stays in the pool.
 */
const lockedScopeLocationsOf = (
  includeNpcChecks: boolean, includeWorldItems: boolean, capacity: CapacityProfile,
  deliverableNpcLocations?: ReadonlySet<string>,
  deliverableWorldLocations?: ReadonlySet<string>,
  pondSlots: PondVanillaSlots = NO_SLOT_RULE,
): ReadonlySet<string> => {
  const locked = new Set<string>();
  lockedTableSubset(NPC_SCOPE_LOCATIONS, includeNpcChecks, deliverableNpcLocations, locked);
  lockedTableSubset(WORLD_ITEM_SCOPE_LOCATIONS, includeWorldItems, deliverableWorldLocations, locked);
  for (const name of [...pondSlots.locked.keys(), ...pondSlots.closed]) locked.delete(name);
  const meterSpot = spotOfFamily('meter');
  if (capacity.meter.mode === 'vanilla' && meterSpot !== undefined) locked.add(meterSpot);
  return locked;
};

/**
 * Spots that are checks: the pond's prize slots that are not locked, plus the
 * meter's giver when not locked. Under the legacy pond the prize slots ARE the
 * present fairy slots, so this is the count it has always been.
 */
const checkSpotCount = (
  capacity: CapacityProfile, pondLocations: readonly string[],
  lockedCapacity: ReadonlySet<string>, lockedScope: ReadonlySet<string>,
): number => {
  const pond = pondLocations.filter((name) => !lockedCapacity.has(name)).length;
  const meterSpot = spotOfFamily('meter');
  const bat = meterSpot !== undefined && capacity.meter.mode !== 'vanilla' && !lockedScope.has(meterSpot) ? 1 : 0;
  return pond + bat;
};

const buildFillWorld = (options: FillWorldOptions): FillWorld => {
  const {
    keyDropShuffle, includeNpcChecks = true, includeWorldItems = includeNpcChecks,
    deliverableNpcLocations, deliverableWorldLocations,
    capacity = REFERENCE_CAPACITY_PROFILE, capacityProgressive = false, capacityBonus = LEGACY_CAPACITY_BONUS,
    deliverableCapacityLocations, medallions,
    shops = NO_SHOP_SCOPE, shopPrices = NO_SHOP_PRICES, ponds = LEGACY_POND_PROFILES, pondDemands,
    pondSlotsFollowMode = false,
    darkRooms = REFERENCE_DARK_ROOM_SETTING, unlitEscapeExempt,
    progressiveTiers = DEFAULT_PROGRESSIVE_SETTING, progressiveModes = DEFAULT_PROGRESSIVE_MODES,
    itemPower = DEFAULT_ITEM_POWER, retroBow = DEFAULT_RETRO_BOW,
    dungeonItems = DEFAULT_DUNGEON_ITEM_SETTING, accessibility = DEFAULT_ACCESSIBILITY,
    difficulty = DEFAULT_DIFFICULTY,
    pickBottle, pickWeapon, pickFiller,
  } = options;

  // Ponds left legacy throughout pass no location list at all, so buildWorld
  // keeps the derivation it has always used and the graph is byte-identical.
  const everyPondLegacy = POND_INSTANCES.every((entry) => ponds[entry.id].mode === 'capacity');
  const pondLocations = presentPondLocations(ponds, capacity, deliverableCapacityLocations);
  const pondSlots = pondVanillaSlotsOf(ponds, deliverableCapacityLocations, pondSlotsFollowMode);
  const world = buildWorld({
    keyDropShuffle: true, capacity, medallions, shops, shopPrices, ponds, darkRooms, unlitEscapeExempt,
    progressiveTiers, progressiveModes, itemPower, retroBow, dungeonItems, accessibility,
    // The demands reach the rules through the world, because that is where the
    // rung ladder is registered from (rules/pond-demands.ts).
    ...(pondDemands === undefined ? {} : { pondDemands }),
    ...(everyPondLegacy ? {} : { pondLocations }),
    ...(pondSlots.closed.length === 0 ? {} : { closedPondSlots: pondSlots.closed }),
    ...(pondSlots.locked.size === 0 ? {} : { lockedPondGrants: pondSlots.locked }),
  });
  registerRules(world);
  // Rules.py installs all but one of its self-locking allowances behind
  // `accessibility != 'full'` (387, 401, 419, 431, 533, 538, 1232), so the
  // registry is pruned to the unconditional row for a full-accessibility seed
  // and kept whole for the two looser contracts.
  if (accessibility === 'full') {
    for (const name of [...world.alwaysAllow.keys()]) {
      if (!FULL_ACCESS_ALWAYS_ALLOW.has(name)) world.alwaysAllow.delete(name);
    }
  }

  const lockedScope = lockedScopeLocationsOf(
    includeNpcChecks, includeWorldItems, capacity, deliverableNpcLocations, deliverableWorldLocations, pondSlots);
  // A prize slot past the reference's two has no vanilla item to fall back to,
  // so a non-legacy pond is all-or-nothing: proven deliverable, or no location.
  const lockedCapacity = ponds[CAPACITY_POND.id].mode === 'capacity'
    ? lockedCapacitySpotsOf(capacity, deliverableCapacityLocations)
    : new Set<string>();

  // The pool builder reads the option from the world it receives; give it a
  // view carrying the REQUESTED flag so the dungeon sets shrink in off mode
  // while the graph itself stays full.
  const poolView: ApWorld = {
    ...world,
    options: {
      ...world.options, keyDropShuffle, includeNpcChecks, includeWorldItems, capacity, capacityProgressive,
      shops, ponds, progressiveTiers, progressiveModes, itemPower, retroBow,
      dungeonItems, accessibility, difficulty,
    },
  };
  const pool = buildItemPool(poolView, pickBottle, lockedScope, lockedCapacity, pickWeapon, pickFiller);

  const lockedVanilla = new Map<string, string>();
  if (!keyDropShuffle) {
    for (const [location, item] of KEY_DROP_LOCATIONS) lockedVanilla.set(location, item);
  }
  for (const [location, item] of NPC_SCOPE_LOCATIONS) {
    if (lockedScope.has(location)) lockedVanilla.set(location, item);
  }
  for (const [location, item] of WORLD_ITEM_SCOPE_LOCATIONS) {
    if (lockedScope.has(location)) lockedVanilla.set(location, item);
  }
  for (const [location, item] of pondSlots.locked) lockedVanilla.set(location, item);
  for (const [location, item] of CAPACITY_UPGRADE_LOCATIONS) {
    if (lockedCapacity.has(location) && world.locationsByName.has(location)) lockedVanilla.set(location, item);
  }
  for (const [location, item] of pool.eventItems) world.placedItems.set(location, item);
  for (const [location, item] of lockedVanilla) world.placedItems.set(location, item);
  // Standard-mode assurance: the chosen starting weapon sits locked on the
  // mentor check before any fill pass (ItemPool.py 318, place_locked_item).
  if (pool.uncleWeapon !== undefined) world.placedItems.set(UNCLE_LOCATION, pool.uncleWeapon);

  const locationDungeon = new Map<string, string>();
  const itemDungeon = new Map<string, string>();
  for (const dungeon of world.dungeons.values()) {
    for (const regionName of dungeon.regions) {
      const region = world.regions.get(regionName);
      for (const location of region?.locations ?? []) {
        locationDungeon.set(location.name, dungeon.name);
      }
    }
    for (const item of [dungeon.smallKey, dungeon.bigKey, dungeon.map, dungeon.compass]) {
      if (item !== null) itemDungeon.set(item, dungeon.name);
    }
  }

  return {
    world, keyDropShuffle, includeNpcChecks, includeWorldItems, capacity, capacityProgressive, capacityBonus,
    shops, shopPrices,
    ponds, pondSlotsFollowMode, pondLocations, darkRooms, progressiveTiers, progressiveModes, itemPower, retroBow,
    dungeonItems, accessibility, difficulty,
    capacityCounts: capacityPoolCountsOf(
      capacity, checkSpotCount(capacity, pondLocations, lockedCapacity, lockedScope)),
    pool, lockedVanilla, locationDungeon, itemDungeon,
  };
};

/** Empty, fillable locations: not an event slot, not a prize slot, not placed. */
const fillEligibleLocations = (fillWorld: FillWorld): string[] =>
  [...fillWorld.world.locationsByName.values()]
    .filter((location) => !location.event && !location.prize
      && !fillWorld.world.placedItems.has(location.name))
    .map((location) => location.name);

export { buildFillWorld, fillEligibleLocations };
