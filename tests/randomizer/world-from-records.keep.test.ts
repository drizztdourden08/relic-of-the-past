/* @layer tests @kind test */
/**
 * What the records already answer for in the engine's world, and what they still cannot.
 *
 * The region collection IS the engine's region list, a check says which region it sits in, a
 * dungeon says which wings it spans, and the passages between regions are one rules table. The
 * suites below hold each of those, including the one thing a set comparison would miss, which
 * is ORDER: the prefill and the normal placement both walk the region map and each dungeon's
 * wings, so the collection's id order has to be the order the reference's four taxonomies list
 * them in, and a dungeon's array order has to be its create order.
 *
 * WHICH ROWS THE SEED FILLS is a record question too now. One rule over kind, scope and the
 * fill's own event pairing (world/seed-locations.ts) picks the 269 spots out of the 594 rows,
 * and the four transcribed lists of location names are gone. Nothing states the set twice any
 * more, so the suite below pins it by COUNT: the whole world, each dungeon, the shelves the
 * shop scope opens and the ladders a pond sells. A number moving means a record moved.
 *
 * ONE thing the reference states is still stated beside the engine, because no record can
 * answer for it yet: WHICH CROSSING A PASSAGE IS. A connection record is a physical crossing;
 * a reference exit is a logical one, carrying its own rule and its own name. 205 of the 392
 * passages join a pair of regions exactly one crossing joins, so those carry its id. The rest
 * cannot: a mirror spot, a retry from the menu and a wing boundary inside one room cross no
 * tile, and a pair joined by two doors cannot say which door a passage is.
 *
 * That number is what the tree measured. LOWERING the gap is progress and the test still
 * passes; raising it means a record got worse, and it fails.
 */
import { describe, expect, it } from 'vitest';
import { all, getRegion } from '@shared/game/data';
import { buildWorld } from '@shared/randomizer/world/build-world';
import { REGION_GRAPH } from '@shared/randomizer/world/rules/tables/region-graph.data';
import { DUNGEON_ORDER } from '@shared/randomizer/world/fill/dungeon-order.data';
import { REGION } from '@shared/randomizer/world/region-ids.data';
import { VANILLA_MEDALLIONS } from '@shared/randomizer/world/item-groups';
import { isSeedLocation } from '@shared/randomizer/world/seed-locations';
import { CANONICAL_SLOTS } from '@shared/randomizer/world/shops/shop-slot-facts';
import { POND_INSTANCES } from '@shared/randomizer/world/pond/pond-instances';
import {
  bunnyImpassableRegionIds, checksByRegion, crossingsByRegion, regionRecords,
} from '@shared/randomizer/world/world-from-records';
import type { RegionId } from '@shared/game/data/types';
import type { World } from '@shared/randomizer/world/world.type';
import { describeDataset } from '../dataset-guard';

/** Every region the collection holds, which is the whole graph the engine walks. */
const REGION_COUNT = 239;
/** The rows the one rule picks out of the collection as spots a seed fills. */
const SEED_LOCATIONS = 269;
/** The world's own locations with key drops on, which is those rows minus the pond pairs. */
const WORLD_LOCATIONS = 264;
/** The same world with key drops off: the 33 spots that option invents are gone. */
const WORLD_LOCATIONS_NO_KEY_DROPS = 231;

/** What each dungeon holds with key drops on, in create order. */
const DUNGEON_LOCATIONS: readonly number[] = [9, 9, 10, 7, 5, 15, 11, 11, 16, 13, 12, 15, 32];

/** The regions the records flag as impassable while transformed, by the name they are known by. */
const BUNNY_IMPASSABLE: readonly string[] = [
  'Bumper Cave', 'Two Brothers House', 'Hookshot Cave', 'Skull Woods First Section (Right)',
  'Skull Woods First Section (Left)', 'Skull Woods First Section (Top)', 'Turtle Rock (Entrance)',
  'Turtle Rock (Second Section)', 'Turtle Rock (Big Chest)', 'Skull Woods Second Section (Drop)',
  'Turtle Rock (Eye Bridge)', 'Sewers', 'Pyramid', 'Spiral Cave (Top)',
  'Desert Palace Main (Inner)', 'Fairy Ascension Cave (Drop)',
  'Light World Death Mountain Shop',
];

/** Passages that name the crossing the records draw for them. */
const PASSAGES_WITH_A_CROSSING = 205;
/** Crossings the records draw between two regions the graph joins with no passage. */
const CROSSINGS_NO_PASSAGE_MAKES = 439;

const world = (): World => buildWorld({
  keyDropShuffle: true,
  medallions: { ...VANILLA_MEDALLIONS },
  pondLocations: [],
  pondPrizeLocations: [],
});

describeDataset('the records are the engine region list', () => {
  it('hands over every region once, in record order', () => {
    const ids = regionRecords().map((region) => region.id);
    expect(ids).toHaveLength(REGION_COUNT);
    expect(new Set(ids).size).toBe(REGION_COUNT);
    expect(ids).toEqual([...ids].sort());
  });

  it('builds a graph keyed by record id, carrying the record name, world and type', () => {
    const regions = [...world().regions.values()];
    expect(regions.map((region) => region.id)).toEqual(regionRecords().map((region) => region.id));
    const wrong = regions
      .filter((region) => {
        const record = getRegion(region.id);
        return region.name !== record.name || region.type !== record.type;
      })
      .map((region) => region.id);
    expect(wrong).toEqual([]);
  });

  it('joins two known regions on every passage, and names each passage once', () => {
    const known = new Set(regionRecords().map((region) => region.id));
    const wrong = REGION_GRAPH
      .filter((row) => !known.has(row.from) || !known.has(row.to))
      .map((row) => row.exit);
    expect(wrong).toEqual([]);
    expect(new Set(REGION_GRAPH.map((row) => row.exit)).size).toBe(REGION_GRAPH.length);
  });

  it('builds one exit per passage, from the region the row leaves', () => {
    const exits = [...world().regions.values()].flatMap((region) => region.exits);
    expect(exits).toHaveLength(REGION_GRAPH.length);
    expect(exits.map((exit) => `${exit.source}>${exit.name}>${exit.target}`))
      .toEqual(REGION_GRAPH.map((row) => `${row.from}>${row.exit}>${row.to}`));
  });
});

describeDataset('the dungeons and the medallion gates read the same collection', () => {
  it('spans the wings its record names, in the records own order', () => {
    const built = world();
    expect([...built.dungeons.values()]).toHaveLength(DUNGEON_ORDER.length);
    const wrong: string[] = [];
    for (const dungeon of built.dungeons.values()) {
      for (const regionId of dungeon.regions) {
        if (!built.regions.has(regionId)) wrong.push(`${dungeon.id} -> ${regionId} (no record)`);
        else if (getRegion(regionId).dungeonId !== dungeon.id) {
          wrong.push(`${dungeon.id} -> ${regionId} of ${getRegion(regionId).dungeonId}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('spans all but the three wings the reference leaves out of its own dungeons', () => {
    const built = world();
    const spanned = new Set([...built.dungeons.values()].flatMap((dungeon) => dungeon.regions));
    const wings = regionRecords().filter((region) => region.dungeonId !== undefined);
    // Three places the reference holds as regions of the world and not as members of the
    // dungeon: a secret room under the first castle and the two bomb walls in the last cave.
    // A dungeon's list decides which items its prefill restricts, so these stay out of it.
    const outside = wings.filter((region) => !spanned.has(region.id)).map((region) => region.name);
    expect(outside).toEqual([
      'Sewers Secret Room', 'Turtle Rock (Second Section Bomb Wall)',
      'Turtle Rock (Eye Bridge Bomb Wall)',
    ]);
    expect(spanned.size).toBe(wings.length - outside.length);
  });

  it('keeps the two medallion entrances as exits of the graph', () => {
    const built = world();
    const names = new Set([...built.regions.values()].flatMap((region) => region.exits).map((exit) => exit.name));
    expect(names.has('Misery Mire')).toBe(true);
    expect(names.has('Turtle Rock')).toBe(true);
    expect(built.options.medallions).toEqual(VANILLA_MEDALLIONS);
  });
});

describeDataset('the transform-suppression flag lives on the record', () => {
  it('flags exactly the regions the reference names', () => {
    const flagged = bunnyImpassableRegionIds().map((id) => getRegion(id).name).sort();
    expect(flagged).toEqual([...BUNNY_IMPASSABLE].sort());
  });

  it('leaves the mountain shop out of the second-world set, so both its paths stay no-ops', () => {
    const shop = world().regions.get(REGION.mountainShop);
    expect(shop?.isDarkWorld).toBe(false);
  });
});

describeDataset('the records say which rows a seed fills', () => {
  it('picks the spots out of the collection, and gives every one of them a region', () => {
    const spots = all('check').filter(isSeedLocation);
    expect(spots).toHaveLength(SEED_LOCATIONS);
    expect(spots.filter((check) => check.regionId === undefined).map((check) => check.id)).toEqual([]);
  });

  it('builds a world of exactly those spots, under the option that invents some of them', () => {
    expect(world().locationsByKey.size).toBe(WORLD_LOCATIONS);
    const off = buildWorld({
      keyDropShuffle: false,
      medallions: { ...VANILLA_MEDALLIONS },
      pondLocations: [],
      pondPrizeLocations: [],
    });
    expect(off.locationsByKey.size).toBe(WORLD_LOCATIONS_NO_KEY_DROPS);
  });

  it('gives each dungeon the spots its own wings hold, in create order', () => {
    const built = world();
    const counts = [...built.dungeons.values()].map((dungeon) => dungeon.regions
      .reduce((sum, id) => sum + (built.regions.get(id)?.locations.length ?? 0), 0));
    expect(counts).toEqual(DUNGEON_LOCATIONS);
  });

  it('leaves the shelves and the pond rungs to their own switches, which open none by default', () => {
    const built = world();
    expect(CANONICAL_SLOTS.filter((row) => built.locationsByKey.has(row.checkId))).toEqual([]);
    const rungs = POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => slot.key));
    expect(rungs.filter((key) => built.locationsByKey.has(key))).toEqual([]);
  });

  it('leaves a region only on the rows that stand for a place', () => {
    const placeless = all('check').filter((check) => check.regionId === undefined);
    expect(placeless.every((check) => check.kind === 'event' && check.screenId === undefined)).toBe(true);
    expect(placeless.length).toBeLessThanOrEqual(23);
  });

  it('holds sixteen regions no screen carries, which is why a screen cannot answer for this', () => {
    const owned = new Set(all('screen').map((screen) => screen.regionId));
    const screenless = regionRecords().filter((region) => !owned.has(region.id));
    expect(screenless.length).toBeLessThanOrEqual(16);
  });
});

describeDataset('a passage names its crossing where the records can say which one', () => {
  it('names one where exactly one crossing joins the same pair', () => {
    const byPair = new Map<string, RegionId[]>();
    for (const crossing of [...crossingsByRegion().values()].flat()) {
      const key = `${crossing.from}>${crossing.to}`;
      byPair.set(key, [...(byPair.get(key) ?? []), crossing.connectionId]);
    }
    const named = REGION_GRAPH.filter((row) => row.connectionId !== undefined);
    expect(named.length).toBeGreaterThanOrEqual(PASSAGES_WITH_A_CROSSING);
    const wrong = named.filter((row) => {
      const only = byPair.get(`${row.from}>${row.to}`);
      return only?.length !== 1 || only[0] !== row.connectionId;
    });
    expect(wrong.map((row) => row.exit)).toEqual([]);
  });

  it('leaves the crossings no passage joins, which is the gap still to close', () => {
    const joined = new Set(REGION_GRAPH.map((row) => `${row.from}>${row.to}`));
    const orphans = [...crossingsByRegion().values()].flat()
      .filter((crossing) => !joined.has(`${crossing.from}>${crossing.to}`));
    expect(orphans.length).toBeLessThanOrEqual(CROSSINGS_NO_PASSAGE_MAKES);
  });
});
