/* @layer tests @kind test */
import { createHash } from 'crypto';
import { describe, expect, it } from 'vitest';
import { optionByKey, AP_ID_BASE, AP_ITEM_ID_OFFSET, AP_ITEM_IDS, AP_ITEM_NAMES, AP_LOCATION_IDS, AP_LOCATION_NAMES, apItemIdOf, apLocationIdOf, itemKeyOfApId, locationKeyOfApId, apItemUniverse, apLocationUniverse, FAMILIES, ITEM, POND_EXTRA_LOCATIONS, PRIZE_ITEMS, WORLD_EVENT_IDS, RETRO_QUIVER_ITEM, ALL_SHOP_SLOT_LOCATIONS } from '@rotp/randomizer';
import { describeDataset } from '../dataset-guard';

const FROZEN_LOCATIONS = 472;
const FROZEN_ITEMS = 277;

const LOCATION_DIGEST = 'a44c5f9c4d75ff6cd75636b16ac097b15afd8c9288ca102be82de1b0b5ede22f';
const ITEM_DIGEST = '0b93d5ec195651666495bd173f75f2610b480c1344cd9a202ee12d84d2125161';

const APPEND_ONLY = 'Archipelago ids are append-only: an id already handed out was changed, reused or removed';

const digestOf = (ids: Readonly<Record<string, number>>, base: number, count: number): string => {
  const lines = Object.entries(ids)
    .filter(([, id]) => id < base + count)
    .sort(([, left], [, right]) => left - right)
    .map(([key, id]) => `${id}=${key}`);
  return createHash('sha256').update(lines.join('\n')).digest('hex');
};

const itemBase = AP_ID_BASE + AP_ITEM_ID_OFFSET;
const locationIds = Object.values(AP_LOCATION_IDS);
const itemIds = Object.values(AP_ITEM_IDS);

const missing = (keys: Iterable<string>, table: Readonly<Record<string, number>>): string[] =>
  [...keys].filter((key) => table[key] === undefined);

const capacityItemsOf = (family: (typeof FAMILIES)[number]): string[] => [
  family.progressiveItem,
  ...Array.from({ length: family.maxJump }, (_unused, index) => family.itemFor(index + 1)),
];

describeDataset('Archipelago ids cover the whole world', () => {
  it('gives every location any option can declare an id', () => {
    expect(missing(apLocationUniverse(), AP_LOCATION_IDS)).toEqual([]);
    expect(missing(ALL_SHOP_SLOT_LOCATIONS.keys(), AP_LOCATION_IDS)).toEqual([]);
    expect(missing(POND_EXTRA_LOCATIONS, AP_LOCATION_IDS)).toEqual([]);
  });

  it('gives every item any option can pool an id', () => {
    const handles = Object.values(ITEM);
    const capacity = FAMILIES.flatMap(capacityItemsOf);
    expect(missing(apItemUniverse(), AP_ITEM_IDS)).toEqual([]);
    expect(missing([...handles, ...capacity, ...PRIZE_ITEMS, RETRO_QUIVER_ITEM], AP_ITEM_IDS)).toEqual([]);
  });

  it('gives no story event an id, as Archipelago gives an event none', () => {
    expect(WORLD_EVENT_IDS.filter((key) => key in AP_LOCATION_IDS)).toEqual([]);
    expect(apLocationUniverse().filter((key) => (WORLD_EVENT_IDS as readonly string[]).includes(key))).toEqual([]);
  });
});

describeDataset('Archipelago ids are unique and named', () => {
  it('uses every id once, locations and items in their own ranges', () => {
    expect(new Set([...locationIds, ...itemIds]).size).toBe(locationIds.length + itemIds.length);
    expect(locationIds.every((id) => id >= AP_ID_BASE && id < itemBase)).toBe(true);
    expect(itemIds.every((id) => id >= itemBase)).toBe(true);
  });

  it('names every id exactly once, with no name twice in a table', () => {
    for (const [ids, names] of [[locationIds, AP_LOCATION_NAMES], [itemIds, AP_ITEM_NAMES]] as const) {
      expect(Object.keys(names).map(Number).sort()).toEqual([...ids].sort());
      expect(new Set(Object.values(names)).size).toBe(ids.length);
    }
  });

  it('looks up both ways, and throws on what the table does not hold', () => {
    expect(locationKeyOfApId(apLocationIdOf('slot-pond-capacity-7'))).toBe('slot-pond-capacity-7');
    expect(itemKeyOfApId(apItemIdOf(ITEM.hookshot))).toBe(ITEM.hookshot);
    expect(() => apLocationIdOf('slot-nowhere')).toThrow(/no Archipelago/);
    expect(() => itemKeyOfApId(0)).toThrow(/no Archipelago/);
  });
});

describeDataset('Archipelago ids are frozen', () => {
  it('keeps every location id already handed out', () => {
    expect(locationIds.length, APPEND_ONLY).toBeGreaterThanOrEqual(FROZEN_LOCATIONS);
    expect(digestOf(AP_LOCATION_IDS, AP_ID_BASE, FROZEN_LOCATIONS), APPEND_ONLY).toBe(LOCATION_DIGEST);
  });

  it('keeps every item id already handed out', () => {
    expect(itemIds.length, APPEND_ONLY).toBeGreaterThanOrEqual(FROZEN_ITEMS);
    expect(digestOf(AP_ITEM_IDS, itemBase, FROZEN_ITEMS), APPEND_ONLY).toBe(ITEM_DIGEST);
  });
});

describe('the death_link option', () => {
  it('is a real choice made with the other options, off by default', () => {
    expect(optionByKey.get('death_link')).toMatchObject({ kind: 'toggle', locked: false, baseline: false, implementation: 'active' });
  });
});
