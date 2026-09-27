/* @layer tests @kind test */
/**
 * The Archipelago id tables (shared/randomizer/archipelago/ap-ids.data.ts) are complete,
 * unique and FROZEN.
 *
 * Complete: every location the widest world declares and every item any option can put in
 * the pool has an id, and no event carries one. Unique: no id is used twice across both
 * tables, and no name twice within one. Frozen: the ids handed out so far are pinned by a
 * digest over the first FROZEN_* ids of each table. Appending new ids past them leaves the
 * digest alone; editing, reusing or removing one fails, because a seed already generated
 * carries those numbers. After an append, raise the count and the digest together.
 *
 * The player file speaks the package's option ids too: a choice whose value is the word
 * random is written as its id (Archipelago would roll the word), the word is never written
 * bare, and death_link comes from the profile's toggle.
 */
import { createHash } from 'crypto';
import { describe, expect, it } from 'vitest';
import { renderPlayerYaml } from '@shared/randomizer/archipelago/player-yaml';
import { emitYaml } from '@shared/randomizer/archipelago/yaml-emit';
import { choiceIdOf } from '@shared/randomizer/archipelago/export/export-options';
import { baselineValues, optionByKey } from '@shared/randomizer/world/options.data';
import type { OptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import { AP_ID_BASE, AP_ITEM_ID_OFFSET } from '@shared/randomizer/archipelago/ap-game';
import {
  AP_ITEM_IDS, AP_ITEM_NAMES, AP_LOCATION_IDS, AP_LOCATION_NAMES,
} from '@shared/randomizer/archipelago/ap-ids.data';
import {
  apItemIdOf, apLocationIdOf, itemKeyOfApId, locationKeyOfApId,
} from '@shared/randomizer/archipelago/ap-id-lookup';
import { apItemUniverse } from '@shared/randomizer/archipelago/ap-item-universe';
import { apLocationUniverse } from '@shared/randomizer/archipelago/ap-location-universe';
import { FAMILIES } from '@shared/randomizer/world/capacity/capacity-family';
import { ITEM } from '@shared/randomizer/world/item-ids.data';
import { POND_EXTRA_LOCATIONS } from '@shared/randomizer/world/pond/pond-rungs';
import { EVENT_ITEMS, PRIZE_ITEMS } from '@shared/randomizer/world/pool/event-items.data';
import { RETRO_QUIVER_ITEM } from '@shared/randomizer/world/retro/retro-bow.data';
import { ALL_SHOP_SLOT_LOCATIONS } from '@shared/randomizer/world/shops/shop-slots';
import { describeDataset } from '../dataset-guard';

/** How many ids each table has handed out and pinned. Only ever raised, never lowered. */
const FROZEN_LOCATIONS = 472;
const FROZEN_ITEMS = 277;

/**
 * sha256 over `id=key` lines of the frozen ids, in id order.
 *
 * The location digest was re-pinned once for a rename that kept every id and every name: the
 * 155 shop keys moved from a shelf's check id (`check-638`) and its restocks
 * (`slot-check-638-2`) to `kakariko-shop-shelf_left-slot_1` and `..._slot_2`. With each new key
 * mapped back to its old one, the table hashes to the previous digest,
 * 736690669490347d1fa78bcf312613bccf0ef65db28c5f02c7978f1ebb55c9d9.
 */
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
const eventItems = new Set<string>(EVENT_ITEMS.values());

const missing = (keys: Iterable<string>, table: Readonly<Record<string, number>>): string[] =>
  [...keys].filter((key) => table[key] === undefined);

describeDataset('Archipelago ids cover the whole world', () => {
  it('gives every location any option can declare an id', () => {
    expect(missing(apLocationUniverse(), AP_LOCATION_IDS)).toEqual([]);
    expect(missing(ALL_SHOP_SLOT_LOCATIONS.keys(), AP_LOCATION_IDS)).toEqual([]);
    expect(missing(POND_EXTRA_LOCATIONS, AP_LOCATION_IDS)).toEqual([]);
  });

  it('gives every item any option can pool an id', () => {
    const handles = Object.values(ITEM).filter((item) => !eventItems.has(item));
    const capacity = FAMILIES.flatMap((family) => [
      family.progressiveItem,
      ...Array.from({ length: family.maxJump }, (_unused, index) => family.itemFor(index + 1)),
    ]);
    expect(missing(apItemUniverse(), AP_ITEM_IDS)).toEqual([]);
    expect(missing([...handles, ...capacity, ...PRIZE_ITEMS, RETRO_QUIVER_ITEM], AP_ITEM_IDS)).toEqual([]);
  });

  it('gives no event an id, as Archipelago gives it none', () => {
    expect([...EVENT_ITEMS.keys()].filter((key) => key in AP_LOCATION_IDS)).toEqual([]);
    expect([...eventItems].filter((key) => key in AP_ITEM_IDS)).toEqual([]);
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

describe('the player file', () => {
  const snapshot = (over: Record<string, OptionValue>): RandomizerOptionsSnapshot =>
    ({ schema: 'ap-options-v2', values: { ...baselineValues, ...over } });
  const lineOf = (yaml: string, key: string): string | undefined =>
    yaml.split('\n').find((line) => line.trimStart().startsWith(`${key}:`))?.trim();

  it('writes a choice valued random as its id, which the package reads back as random', () => {
    const yaml = renderPlayerYaml({
      slotName: 'Link', options: snapshot({ progressive_mode_sword: 'random', shop_shuffle_mode: 'random' }),
    });
    const sword = optionByKey.get('progressive_mode_sword');
    const shops = optionByKey.get('shop_shuffle_mode');
    expect(lineOf(yaml, 'progressive_mode_sword')).toBe(`progressive_mode_sword: ${choiceIdOf(sword!, 'random')}`);
    expect(lineOf(yaml, 'shop_shuffle_mode')).toBe(`shop_shuffle_mode: ${choiceIdOf(shops!, 'random')}`);
    expect(lineOf(yaml, 'progressive_mode_shield')).toBe('progressive_mode_shield: progressive');
    expect(yaml).not.toMatch(/:\s*random\s*$/m);
  });

  it('never writes the bare word random, nested or not', () => {
    expect(emitYaml({ a: 'random', b: { c: 'Random' }, d: ['random'] })).toBe('a: "random"\nb:\n  c: "Random"\nd:\n  - "random"\n');
  });

  it('writes death_link from the profile toggle over the frozen row', () => {
    const options = snapshot({ death_link: false });
    expect(lineOf(renderPlayerYaml({ slotName: 'Link', options, deathLink: true }), 'death_link')).toBe('death_link: true');
    expect(lineOf(renderPlayerYaml({ slotName: 'Link', options: snapshot({ death_link: true }), deathLink: false }), 'death_link'))
      .toBe('death_link: false');
    // Locked: the profile's own DeathLink toggle is the one control, so the options panel never offers it twice.
    expect(optionByKey.get('death_link')).toMatchObject({ kind: 'toggle', locked: true, baseline: false, implementation: 'active' });
  });
});
