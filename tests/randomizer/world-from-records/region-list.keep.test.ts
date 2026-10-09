/* @layer tests @kind test */
import { expect, it } from 'vitest';
import { getRegion } from '@rotp/game-data';
import { REGION_GRAPH } from '@rotp/randomizer';
import { DUNGEON_ORDER } from '@rotp/randomizer';
import { REGION } from '@rotp/randomizer';
import { VANILLA_MEDALLIONS } from '@rotp/randomizer';
import { bunnyImpassableRegionIds, regionRecords } from '@rotp/randomizer';
import { describeDataset } from '../../dataset-guard';
import { BUNNY_IMPASSABLE, REGION_COUNT } from './world-from-records.constants';
import { vanillaWorld } from './vanilla-world';

describeDataset('the records are the engine region list', () => {
  it('hands over every region once, in record order', () => {
    const ids = regionRecords().map((region) => region.id);
    expect(ids).toHaveLength(REGION_COUNT);
    expect(new Set(ids).size).toBe(REGION_COUNT);
    expect(ids).toEqual([...ids].sort());
  });

  it('builds a graph keyed by record id, carrying the record name, world and type', () => {
    const regions = [...vanillaWorld().regions.values()];
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
    const exits = [...vanillaWorld().regions.values()].flatMap((region) => region.exits);
    expect(exits).toHaveLength(REGION_GRAPH.length);
    expect(exits.map((exit) => `${exit.source}>${exit.name}>${exit.target}`))
      .toEqual(REGION_GRAPH.map((row) => `${row.from}>${row.exit}>${row.to}`));
  });
});

describeDataset('the dungeons and the medallion gates read the same collection', () => {
  it('spans the wings its record names, in the records own order', () => {
    const built = vanillaWorld();
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
    const built = vanillaWorld();
    const spanned = new Set([...built.dungeons.values()].flatMap((dungeon) => dungeon.regions));
    const wings = regionRecords().filter((region) => region.dungeonId !== undefined);
    const outside = wings.filter((region) => !spanned.has(region.id)).map((region) => region.name);
    expect(outside).toEqual([
      'Sewers Secret Room', 'Turtle Rock (Second Section Bomb Wall)',
      'Turtle Rock (Eye Bridge Bomb Wall)',
    ]);
    expect(spanned.size).toBe(wings.length - outside.length);
  });

  it('keeps the two medallion entrances as exits of the graph', () => {
    const built = vanillaWorld();
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
    const shop = vanillaWorld().regions.get(REGION.mountainShop);
    expect(shop?.isDarkWorld).toBe(false);
  });
});
