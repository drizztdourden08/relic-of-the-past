/* @layer shared-game @kind logic */
/**
 * Assembles the world model: raw region rows + the three vanilla wiring
 * tables → wired regions, resolved locations, dungeons, and an empty rule
 * registry (rules attach in P3). Ports the standard-mode path of
 * tests/fixtures/ap-source/Regions.py create_regions + EntranceShuffle.py
 * link_entrances (entrance shuffle 'vanilla' — mode-independent there) with
 * the standard start connection from Rules.py standard_rules 1091. Wiring errors throw: a
 * connection naming an unknown exit or region is a porting bug, not data.
 */
import { LIGHT_REGIONS } from './regions-light.data';
import { DARK_REGIONS } from './regions-dark.data';
import { CAVE_REGIONS } from './regions-caves.data';
import { DUNGEON_REGIONS } from './regions-dungeons.data';
import { MANDATORY_CONNECTIONS } from './connections-mandatory.data';
import { DEFAULT_CONNECTIONS } from './connections-default.data';
import { DEFAULT_DUNGEON_CONNECTIONS } from './connections-dungeon.data';
import {
  KEY_DROP_LOCATIONS, CAPACITY_UPGRADE_LOCATIONS, EVENT_LOCATIONS, PRIZE_LOCATIONS,
} from './special-locations.data';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from './scope-vanilla.data';
import { shopLocationNamesByRegion } from './shops/shop-slots';
import { AP_DUNGEONS } from './dungeons.data';
import { markWorldZones } from './world-zones';
import { REFERENCE_CAPACITY_PROFILE } from './capacity/capacity-profile-defaults';
import { isCapacitySpotPresent } from './capacity/capacity-spots';
import { POND_LOCATION_SET } from './pond/pond-locations.data';
import { isPondExtraLocation } from './pond/pond-spots';
import { VICTORY_ITEM } from './pool/event-items.data';
import type { ApExit, ApLocation, ApRegion, ApRegionDef } from './region.type';
import type { CapacityProfile } from './capacity/capacity-profile.type';
import type { ApWorld, ApWorldOptions, ItemRule, Rule } from './world.type';

const ALLOW_ANY_ITEM: ItemRule = () => true;

const ALL_REGION_DEFS: readonly ApRegionDef[] = [
  ...LIGHT_REGIONS,
  ...DARK_REGIONS,
  ...CAVE_REGIONS,
  ...DUNGEON_REGIONS,
];

const ALL_CONNECTIONS = [
  ...MANDATORY_CONNECTIONS,
  ...DEFAULT_CONNECTIONS,
  ...DEFAULT_DUNGEON_CONNECTIONS,
];

const vanillaItemOf = (name: string): string | undefined =>
  KEY_DROP_LOCATIONS.get(name) ?? CAPACITY_UPGRADE_LOCATIONS.get(name)
  ?? NPC_SCOPE_LOCATIONS.get(name) ?? WORLD_ITEM_SCOPE_LOCATIONS.get(name);

const buildLocation = (name: string, region: string): ApLocation => {
  const vanillaItem = vanillaItemOf(name);
  return {
    name,
    region,
    kdsOnly: KEY_DROP_LOCATIONS.has(name),
    capacityOnly: CAPACITY_UPGRADE_LOCATIONS.has(name),
    pondSlot: POND_LOCATION_SET.has(name),
    prize: PRIZE_LOCATIONS.has(name),
    event: EVENT_LOCATIONS.has(name),
    ...(vanillaItem !== undefined ? { vanillaItem } : {}),
  };
};

/**
 * A shelf slot the profile opened. It exists only while the shop scope asks
 * for it, so a scope of zero slots leaves the graph exactly as it was.
 */
const buildShopLocation = (name: string, region: string): ApLocation => ({
  name,
  region,
  kdsOnly: false,
  capacityOnly: false,
  pondSlot: false,
  prize: false,
  event: false,
});

/**
 * Whether a pond prize slot is a location in this world. An absent
 * `pondLocations` is the legacy world: the reference's two slots follow their
 * capacity family and no further prize slot exists at all, so every caller
 * that predates the pond option builds exactly the world it always did.
 */
const isPondSlotPresent = (
  name: string, capacity: CapacityProfile, pondLocations: readonly string[] | undefined,
): boolean =>
  (pondLocations === undefined
    ? !isPondExtraLocation(name) && isCapacitySpotPresent(capacity, name)
    : pondLocations.includes(name));

const buildWorld = (options: ApWorldOptions): ApWorld => {
  const { keyDropShuffle, capacity = REFERENCE_CAPACITY_PROFILE, shops, pondLocations } = options;
  const shopLocations = shops === undefined
    ? new Map<string, readonly string[]>()
    : shopLocationNamesByRegion(shops);

  const regions = new Map<string, ApRegion>();
  const exitsByName = new Map<string, ApExit>();
  for (const def of ALL_REGION_DEFS) {
    if (regions.has(def.name)) throw new Error(`duplicate region: ${def.name}`);
    const locations = def.locations
      .map((name) => buildLocation(name, def.name))
      .filter((location) => (keyDropShuffle || !location.kdsOnly)
        && (!location.pondSlot || isPondSlotPresent(location.name, capacity, pondLocations)));
    for (const name of shopLocations.get(def.name) ?? []) {
      locations.push(buildShopLocation(name, def.name));
    }
    const exits: ApExit[] = def.exits.map((name) => ({ name, source: def.name, target: '' }));
    for (const exit of exits) {
      if (exitsByName.has(exit.name)) throw new Error(`duplicate exit: ${exit.name}`);
      exitsByName.set(exit.name, exit);
    }
    regions.set(def.name, {
      name: def.name,
      type: def.type,
      locations,
      exits,
      entrances: [],
      isLightWorld: false,
      isDarkWorld: false,
    });
  }

  for (const [exitName, targetName] of ALL_CONNECTIONS) {
    const exit = exitsByName.get(exitName);
    if (exit === undefined) throw new Error(`connection names unknown exit: ${exitName}`);
    const target = regions.get(targetName);
    if (target === undefined) throw new Error(`connection names unknown region: ${targetName}`);
    if (exit.target !== '') throw new Error(`exit wired twice: ${exitName}`);
    exit.target = targetName;
    target.entrances.push(exit);
  }
  const unwired = [...exitsByName.values()].filter((exit) => exit.target === '');
  if (unwired.length > 0) {
    throw new Error(`unwired exits: ${unwired.map((exit) => exit.name).join(', ')}`);
  }

  markWorldZones(regions);

  const locationsByName = new Map<string, ApLocation>();
  for (const region of regions.values()) {
    for (const location of region.locations) {
      if (locationsByName.has(location.name)) throw new Error(`duplicate location: ${location.name}`);
      locationsByName.set(location.name, location);
    }
  }

  const dungeons = new Map(AP_DUNGEONS.map((dungeon) => [dungeon.name, dungeon]));
  const rules = new Map<string, Rule>();
  const locationRules = new Map<string, Rule>();
  const itemRules = new Map<string, ItemRule>();

  return {
    regions,
    locationsByName,
    dungeons,
    options,
    rules,
    locationRules,
    itemRules,
    alwaysAllow: new Map(),
    placedItems: new Map(),
    getRule: (name) => rules.get(name),
    getLocationRule: (name) => locationRules.get(name),
    getItemRule: (name) => itemRules.get(name) ?? ALLOW_ANY_ITEM,
    // Rules.py 51: the goal item sits on the final fight's event location.
    isBeaten: (state) => state.has(VICTORY_ITEM),
  };
};

export { buildWorld };
