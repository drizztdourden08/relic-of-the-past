/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { all, getCheck } from '@rotp/game-data';
import { REGION_GRAPH, isSeedLocation, CANONICAL_SLOTS, POND_INSTANCES, crossingsByRegion, regionRecords } from '@rotp/randomizer';
import type { ConnectionId, RegionId } from '@rotp/game-data';
import type { World } from '@rotp/randomizer';
import { describeDataset } from '../../dataset-guard';
import {
  CROSSINGS_NO_PASSAGE_MAKES, DUNGEON_LOCATIONS, PASSAGES_WITH_A_CROSSING, PLACELESS_ROWS_AT_MOST,
  SCREENLESS_REGIONS_AT_MOST, SEED_LOCATIONS, WORLD_EVENTS, WORLD_LOCATIONS, WORLD_LOCATIONS_NO_KEY_DROPS,
} from './world-from-records.constants';
import { vanillaWorld } from './vanilla-world';

const spotCountOf = (built: World, regions: readonly RegionId[]): number =>
  regions.reduce((sum, id) => sum + (built.regions.get(id)?.locations.length ?? 0), 0);

const pondRungKeys = () => POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => slot.key));

describeDataset('the records say which rows a seed fills', () => {
  it('picks the spots out of the collection, and gives every one of them a region', () => {
    const spots = all('check').filter(isSeedLocation);
    expect(spots).toHaveLength(SEED_LOCATIONS);
    expect(spots.filter((check) => check.regionId === undefined).map((check) => check.id)).toEqual([]);
  });

  it('builds a world of exactly those spots, under the option that invents some of them', () => {
    expect(vanillaWorld().locationsByKey.size).toBe(WORLD_LOCATIONS);
    expect([...vanillaWorld().eventsByKey.values()].filter((event) => getCheck(event.key).regionId === event.region))
      .toHaveLength(WORLD_EVENTS);
    expect(vanillaWorld(false).locationsByKey.size).toBe(WORLD_LOCATIONS_NO_KEY_DROPS);
  });

  it('gives each dungeon the spots its own wings hold, in create order', () => {
    const built = vanillaWorld();
    const counts = [...built.dungeons.values()].map((dungeon) => spotCountOf(built, dungeon.regions));
    expect(counts).toEqual(DUNGEON_LOCATIONS);
  });

  it('leaves the shelves and the pond rungs to their own switches, which open none by default', () => {
    const built = vanillaWorld();
    expect(CANONICAL_SLOTS.filter((row) => built.locationsByKey.has(row.checkId))).toEqual([]);
    const rungs = pondRungKeys();
    expect(rungs.filter((key) => built.locationsByKey.has(key))).toEqual([]);
  });

  it('leaves a region only on the rows that stand for a place', () => {
    const placeless = all('check').filter((check) => check.regionId === undefined);
    expect(placeless.every((check) => check.kind === 'event' && check.screenId === undefined)).toBe(true);
    expect(placeless.length).toBeLessThanOrEqual(PLACELESS_ROWS_AT_MOST);
  });

  it('holds sixteen regions no screen carries, which is why a screen cannot answer for this', () => {
    const owned = new Set(all('screen').map((screen) => screen.regionId));
    const screenless = regionRecords().filter((region) => !owned.has(region.id));
    expect(screenless.length).toBeLessThanOrEqual(SCREENLESS_REGIONS_AT_MOST);
  });
});

describeDataset('a passage names its crossing where the records can say which one', () => {
  it('names one where exactly one crossing joins the same pair', () => {
    const byPair = new Map<string, ConnectionId[]>();
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
