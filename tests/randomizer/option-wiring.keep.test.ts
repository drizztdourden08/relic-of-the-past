/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { randomizerChoiceOverrides, snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import { partitionCatalogByLock } from '@app/compounds/RandomizerOptionRow/behavior/partitionCatalogByLock';
import { OPTION_GROUPS, optionCatalog } from '@rotp/randomizer';
import { DEFAULT_CAPACITY_BONUS, customSetting } from '@rotp/randomizer';
import { DEFAULT_ITEM_POWER } from '@rotp/randomizer';
import { DEFAULT_DARK_ROOM_SETTING } from '@rotp/randomizer';
import { DEFAULT_ACCESSIBILITY } from '@rotp/randomizer';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '@rotp/randomizer';
import { DARK_ROOM_OPTION_KEYS } from '@rotp/randomizer';
import { DIFFICULTY_OPTION_KEYS } from '@rotp/randomizer';
import { defaultDifficulty } from '@rotp/randomizer';
import { defaultProgressiveSetting } from '@rotp/randomizer';
import { defaultProgressiveModes } from '@rotp/randomizer';
import { defaultRetroBow } from '@rotp/randomizer';
import { LEGACY_POND_PROFILES } from '@rotp/randomizer';
import { SHOP_PRICE_BLOCK_KEYS, SHOP_PRICE_OPTION_KEYS } from '@rotp/randomizer';
import { SHOP_SCOPE_OPTION_KEYS } from '@rotp/randomizer';
import { defaultShopScope } from '@rotp/randomizer';
import { CANONICAL_SLOTS } from '@rotp/randomizer';
import { accountingOf } from '@rotp/randomizer';
import { fillFlagsOf } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

const BASE: RandomizerOptionChoices = {
  keyDropShuffle: true,
  includeNpcChecks: false,
  includeWorldItems: false,
  shufflePrizes: false,
  bigKeyShuffle: DEFAULT_DUNGEON_ITEM_SETTING.bigKey,
  smallKeyShuffle: DEFAULT_DUNGEON_ITEM_SETTING.smallKey,
  compassShuffle: DEFAULT_DUNGEON_ITEM_SETTING.compass,
  mapShuffle: DEFAULT_DUNGEON_ITEM_SETTING.map,
  shops: { ...defaultShopScope(), mode: 'vanilla' },
  shopPrices: {},
  capacityEnabled: true,
  capacity: {
    explosives: customSetting(10, 15, 1),
    projectiles: customSetting(30, 35, 1),
    meter: { mode: 'vanilla-in-pool' },
    wallet: { mode: 'vanilla' },
  },
  capacityProgressive: true,
  capacityBonus: DEFAULT_CAPACITY_BONUS,
  ponds: LEGACY_POND_PROFILES,
  progressiveTiers: defaultProgressiveSetting(),
  progressiveModes: defaultProgressiveModes(),
  retroBow: defaultRetroBow(),
  difficulty: defaultDifficulty(),
  itemPower: DEFAULT_ITEM_POWER,
  accessibility: DEFAULT_ACCESSIBILITY,
  darkRoomLightRequired: DEFAULT_DARK_ROOM_SETTING.requireLight,
  darkRoomLightLamp: DEFAULT_DARK_ROOM_SETTING.lights.lamp,
  darkRoomLightFireRod: DEFAULT_DARK_ROOM_SETTING.lights.fireRod,
  darkRoomLightBombos: DEFAULT_DARK_ROOM_SETTING.lights.bombos,
  darkRoomLightRedCane: DEFAULT_DARK_ROOM_SETTING.lights.redCane,
};

const NO_DELIVERABLE = {};

describe('every unlocked catalog row reaches the generator', () => {
  it('covers the whole catalog, since an unwired row would freeze silently', () => {
    const everyPrice = Object.fromEntries(SHOP_PRICE_BLOCK_KEYS.map((key) =>
      [key, SHOP_PRICE_OPTION_KEYS.includes(key) ? false : 100]));
    const overrides = randomizerChoiceOverrides({ ...BASE, shopPrices: everyPrice });
    const unwired = optionCatalog
      .filter((option) => !option.locked)
      .map((option) => option.key)
      .filter((key) => overrides[key] === undefined);
    expect(unwired).toEqual([]);
  });

  it('lists each row once, so a row with its own block stays out of the plain list', () => {
    const { unlocked } = partitionCatalogByLock(optionCatalog, OPTION_GROUPS);
    const keys = unlocked.map((option) => option.key);
    expect(keys.filter((key) => SHOP_PRICE_BLOCK_KEYS.includes(key))).toEqual([]);
    expect(keys.filter((key) => SHOP_SCOPE_OPTION_KEYS.includes(key))).toEqual([]);
    expect(keys.filter((key) => DARK_ROOM_OPTION_KEYS.includes(key))).toEqual([]);
    expect(keys.filter((key) => DIFFICULTY_OPTION_KEYS.includes(key))).toEqual([]);
  });
});

const shopChoice = (
  overrides: Partial<RandomizerOptionChoices['shops']>,
): RandomizerOptionChoices => ({
  ...BASE, shops: { ...defaultShopScope(), mode: 'sequential', depth: 1, ...overrides },
});

describe('the shop controls move the fill', () => {
  it('carries the whole scope into the fill options', () => {
    const choices = shopChoice({ slotCount: 6, depth: 3 });
    const flags = fillFlagsOf(snapshotOfChoices(choices));
    expect(flags.shops.mode).toBe('sequential');
    expect(flags.shops.slotCount).toBe(6);
    expect(flags.shops.depth).toBe(3);
    expect(flags.shops.enabled).toEqual(choices.shops.enabled);
  });

  it('opens shop locations in the live pool accounting', () => {
    const vanilla = accountingOf(snapshotOfChoices(BASE), NO_DELIVERABLE);
    const opened = accountingOf(snapshotOfChoices(shopChoice({ slotCount: 6 })), NO_DELIVERABLE);
    expect(opened.spots - vanilla.spots).toBe(6);
    expect(opened.open).toBeGreaterThan(vanilla.open);
  });

  it('carries an unticked slot through as unticked, so the block is really wired', () => {
    const trimmed = defaultShopScope().enabled.filter((index) => index !== 0);
    const flags = fillFlagsOf(snapshotOfChoices(shopChoice({ enabled: trimmed, mode: 'custom' })));
    expect(flags.shops.enabled).toEqual(trimmed);
  });

  it('never opens more slots than are ticked, whatever the count asks for', () => {
    const ticked = defaultShopScope().enabled.length;
    const flags = fillFlagsOf(snapshotOfChoices(shopChoice({ slotCount: CANONICAL_SLOTS.length + 10 })));
    const accounting = accountingOf(snapshotOfChoices(shopChoice({ slotCount: CANONICAL_SLOTS.length + 10 })), NO_DELIVERABLE);
    const vanilla = accountingOf(snapshotOfChoices(BASE), NO_DELIVERABLE);
    expect(flags.shops.enabled.length).toBe(ticked);
    expect(accounting.spots - vanilla.spots).toBe(ticked);
  });
});
