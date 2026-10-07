/* @layer shared-game @kind logic */
/**
 * Assembles the world model: the region records + the one graph table + the rows' locations →
 * wired regions, resolved locations, dungeons, and an empty rule registry (rules attach in P3).
 * Ports the standard-mode path of Archipelago worlds/alttp/Regions.py create_regions +
 * EntranceShuffle.py link_entrances (entrance shuffle 'vanilla', mode-independent there) with
 * the standard start connection from Rules.py standard_rules 1091. Wiring errors throw: a
 * passage naming an unknown region is a porting bug, not data.
 *
 * A region is a RECORD: the collection hands over all of them, in its own order, and the graph
 * is keyed by their ids (world-from-records.ts). A passage is a RULE row
 * (rules/tables/region-graph.data.ts), which states both of its ends as ids, so no wiring pass
 * resolves anything. A LOCATION is a record too: each region takes its own check rows
 * (`check.regionId`), keeps the ones a seed fills (seed-locations.ts) and hands them over in
 * record order, so no transcribed list of names is left and the whole engine reads ids. A
 * region's story events come from their records the same way (events/world-events.ts). An
 * exit stays named: the reference's exits are logical passages, one per rule, and the rule
 * tables key by that name.
 */
import { getCheck } from '@shared/game/data';
import { REGION_GRAPH } from './rules/tables/region-graph.data';
import {
  CAPACITY_UPGRADE_LOCATIONS, KEY_DROP_LOCATIONS, NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS,
} from './scope-tables';
import { isSeedLocation } from './seed-locations';
import { shopLocationsByRegion } from './shops/shop-slots';
import { DUNGEON_ORDER } from './fill/dungeon-order.data';
import { REGION_LOCATION_ORDER } from './fill/location-order.data';
import { worldDungeonOf } from './world-dungeon';
import { markWorldZones } from './world-zones';
import { POND_LOCATION_SET } from './pond/pond-rungs';
import { POND_REGION_LOCATIONS } from './pond/pond-region-locations';
import { GOAL_EVENT } from './events/story-events.data';
import { worldEventsOf } from './events/world-events';
import { checksByRegion, regionRecords } from './world-from-records';
import type { CheckId, ItemId, RegionId } from '@shared/game/data/types/ids';
import type { LocationKey } from './location-key';
import type { Exit, WorldEvent, WorldLocation, Region, RegionGraphRow } from './region.type';
import type { World, ItemRule, Rule } from './world.type';

const ALLOW_ANY_ITEM: ItemRule = () => true;

/**
 * The keys one region holds, in the order it hands them to the fill.
 *
 * Record order is the reference's own everywhere but two kinds of region. A pond's room sells
 * a ladder longer than its records (pond/pond-region-locations.ts), and nine regions are built
 * in another order there (fill/location-order.data.ts). Either way the stated list has to
 * cover exactly the region's own rows, because a row it drops would leave the world with a
 * spot nothing can fill and a key it adds would name a spot the region does not hold.
 */
const regionLocationKeys = (regionId: RegionId): readonly LocationKey[] => {
  const rows = (checksByRegion().get(regionId) ?? []).filter((id) => isSeedLocation(getCheck(id)));
  const stated = POND_REGION_LOCATIONS.get(regionId) ?? REGION_LOCATION_ORDER[regionId];
  if (stated === undefined) return rows;
  const held = new Set<LocationKey>(rows);
  const wrong = [
    ...rows.filter((id) => !stated.includes(id)),
    ...stated.filter((key) => key.startsWith('check-') && !held.has(key)),
  ];
  if (wrong.length > 0) throw new Error(`stated locations do not match the rows: ${regionId} ${wrong.join(' ')}`);
  return stated;
};

/**
 * The graph's passages by the region they leave, in the table's own order. A second row naming
 * one exit throws here: the rule tables key by that name, so two passages under it would share
 * one requirement and the graph would be lying about one of them.
 */
const passagesBySource = (): ReadonlyMap<RegionId, readonly RegionGraphRow[]> => {
  const rows = new Map<RegionId, RegionGraphRow[]>();
  const named = new Set<string>();
  for (const row of REGION_GRAPH) {
    if (named.has(row.exit)) throw new Error(`duplicate exit: ${row.exit}`);
    named.add(row.exit);
    rows.set(row.from, [...(rows.get(row.from) ?? []), row]);
  }
  return rows;
};

const PASSAGES_BY_SOURCE = passagesBySource();

const vanillaItemOf = (key: LocationKey): ItemId | undefined =>
  KEY_DROP_LOCATIONS.get(key as CheckId) ?? CAPACITY_UPGRADE_LOCATIONS.get(key as CheckId)
  ?? NPC_SCOPE_LOCATIONS.get(key as CheckId) ?? WORLD_ITEM_SCOPE_LOCATIONS.get(key as CheckId);

const buildLocation = (key: LocationKey, region: RegionId): WorldLocation => {
  const vanillaItem = vanillaItemOf(key);
  return {
    key,
    region,
    kdsOnly: KEY_DROP_LOCATIONS.has(key as CheckId),
    capacityOnly: CAPACITY_UPGRADE_LOCATIONS.has(key as CheckId),
    // Every slot a pond owns: a wish pond's own pair, which is rungs 1 and 2 of her ladder,
    // the prize rungs above it, and the capacity pond's two family ladders. Which of them
    // this world holds is `pondLocations` (pond/pond-spots.ts), settled before the graph.
    pondSlot: POND_LOCATION_SET.has(key) || CAPACITY_UPGRADE_LOCATIONS.has(key as CheckId),
    prize: PRIZE_LOCATIONS.has(key as CheckId),
    ...(vanillaItem !== undefined ? { vanillaItem } : {}),
  };
};

/**
 * A shelf slot the profile opened. It exists only while the shop scope asks
 * for it, so a scope of zero slots leaves the graph exactly as it was.
 */
const buildShopLocation = (key: LocationKey, region: RegionId): WorldLocation => ({
  key,
  region,
  kdsOnly: false,
  capacityOnly: false,
  pondSlot: false,
  prize: false,
});

const buildWorld = (options: World['options']): World => {
  const { keyDropShuffle, shops, pondLocations } = options;
  const pondPresent = new Set(pondLocations);
  const shopLocations = shops === undefined
    ? new Map<RegionId, readonly LocationKey[]>()
    : shopLocationsByRegion(shops);

  const regions = new Map<RegionId, Region>();
  for (const record of regionRecords()) {
    const locations = regionLocationKeys(record.id)
      .map((key) => buildLocation(key, record.id))
      .filter((location) => (keyDropShuffle || !location.kdsOnly)
        && (!location.pondSlot || pondPresent.has(location.key)));
    for (const key of shopLocations.get(record.id) ?? []) {
      locations.push(buildShopLocation(key, record.id));
    }
    const exits: Exit[] = (PASSAGES_BY_SOURCE.get(record.id) ?? [])
      .map((row) => ({ name: row.exit, source: record.id, target: row.to }));
    regions.set(record.id, {
      id: record.id,
      name: record.name,
      type: record.type,
      locations,
      events: worldEventsOf(record.id),
      exits,
      entrances: [],
      isLightWorld: false,
      isDarkWorld: false,
    });
  }

  for (const region of regions.values()) {
    for (const exit of region.exits) {
      const target = regions.get(exit.target);
      if (target === undefined) throw new Error(`passage names unknown region: ${exit.name} -> ${exit.target}`);
      target.entrances.push(exit);
    }
  }

  markWorldZones(regions);

  const locationsByKey = new Map<LocationKey, WorldLocation>();
  const eventsByKey = new Map<CheckId, WorldEvent>();
  for (const region of regions.values()) {
    for (const location of region.locations) {
      if (locationsByKey.has(location.key)) throw new Error(`duplicate location: ${location.key}`);
      locationsByKey.set(location.key, location);
    }
    for (const event of region.events) eventsByKey.set(event.key, event);
  }

  // In create_dungeons order, because the prefill pushes each dungeon's items in it.
  const dungeons = new Map(DUNGEON_ORDER.map(worldDungeonOf).map((dungeon) => [dungeon.name, dungeon]));
  const rules = new Map<string, Rule>();
  const locationRules = new Map<LocationKey, Rule>();
  const eventRules = new Map<CheckId, Rule>();
  const itemRules = new Map<LocationKey, ItemRule>();

  return {
    regions,
    locationsByKey,
    eventsByKey,
    dungeons,
    options,
    rules,
    locationRules,
    eventRules,
    itemRules,
    alwaysAllow: new Map(),
    placedItems: new Map(),
    seedValues: new Map(),
    getRule: (name) => rules.get(name),
    getLocationRule: (key) => locationRules.get(key),
    getEventRule: (key) => eventRules.get(key),
    getItemRule: (key) => itemRules.get(key) ?? ALLOW_ANY_ITEM,
    // Rules.py 51: the game is beaten once the final fight is won.
    isBeaten: (state) => state.has(GOAL_EVENT),
  };
};

export { buildWorld };
