/* @layer tests @kind test */
/**
 * Guard: every option the player may change has to reach the generator.
 *
 * The creation panel and the profile writer once built their catalog
 * overrides separately, so a row wired into one and forgotten in the other
 * froze silently — the control moved, the snapshot kept the baseline, and
 * the pool, the totals and the seed never saw it. Both now read
 * randomizerChoiceOverrides, and the first case below walks the WHOLE
 * catalog against it, so the next unwired option fails here instead of
 * looking like a dead control in the app.
 */
import { describe, expect, it } from 'vitest';
import { randomizerChoiceOverrides, snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import { partitionCatalogByLock } from '@app/ui/domains/app/compounds/RandomizerOptionRow/behavior/partitionCatalogByLock';
import { AP_OPTION_GROUPS, apOptionCatalog } from '@shared/randomizer/ap-world/options.data';
import { DEFAULT_CAPACITY_BONUS, LEGACY_SHUFFLE_ON_PROFILE } from '@shared/randomizer/ap-world/capacity';
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/ap-world/item-power/item-power.data';
import { DEFAULT_DARK_ROOM_SETTING } from '@shared/randomizer/ap-world/dark-rooms/dark-room-lights.data';
import { DEFAULT_ACCESSIBILITY } from '@shared/randomizer/ap-world/accessibility/accessibility-from-snapshot';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '@shared/randomizer/ap-world/dungeon-items/dungeon-item-modes';
import { DARK_ROOM_OPTION_KEYS } from '@shared/randomizer/ap-world/dark-rooms/dark-room-option-keys';
import { DIFFICULTY_OPTION_KEYS } from '@shared/randomizer/ap-world/difficulty/difficulty-option-keys';
import { defaultDifficulty } from '@shared/randomizer/ap-world/difficulty/difficulty-from-snapshot';
import { defaultProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive-from-snapshot';
import { defaultProgressiveModes } from '@shared/randomizer/ap-world/progressive/progressive-modes.data';
import { defaultRetroBow } from '@shared/randomizer/ap-world/retro/retro-from-snapshot';
import { LEGACY_POND_SETTING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import {
  SHOP_PRICE_BLOCK_KEYS, SHOP_PRICE_OPTION_KEYS,
} from '@shared/randomizer/ap-world/shops/shop-price-options.data';
import { SHOP_SCOPE_OPTION_KEYS } from '@shared/randomizer/ap-world/shops/shop-slot-options.data';
import { defaultShopScope } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { CANONICAL_SLOTS } from '@shared/randomizer/ap-world/shops/shop-slots';
import { accountingOf } from '@shared/randomizer/ap-world/pool/pool-accounting';
import { fillFlagsOf } from '@shared/randomizer/ap-world/fill/fill-options-from-snapshot';
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
  // The fixture is the unshuffled base the shop cases measure against; the
  // fresh-profile scope itself starts shuffled, so the mode is pinned here.
  shops: { ...defaultShopScope(), mode: 'vanilla' },
  shopPrices: {},
  capacityEnabled: true,
  capacity: LEGACY_SHUFFLE_ON_PROFILE,
  capacityProgressive: true,
  capacityBonus: DEFAULT_CAPACITY_BONUS,
  pond: LEGACY_POND_SETTING,
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
  it('covers the whole catalog — an unwired row would freeze silently', () => {
    // The price block hands its whole key set through verbatim, so the choice
    // that exercises the coverage is one carrying all of them.
    // Every key the block owns, the reference's percentage included — that one
    // is a number, so it is written as one rather than as a tick.
    const everyPrice = Object.fromEntries(SHOP_PRICE_BLOCK_KEYS.map((key) =>
      [key, SHOP_PRICE_OPTION_KEYS.includes(key) ? false : 100]));
    // Read by VALUE, not by key presence: a choice field left off the object
    // still puts its catalog key in the map with nothing behind it, which is
    // exactly the half-wired row this case exists to catch.
    const overrides = randomizerChoiceOverrides({ ...BASE, shopPrices: everyPrice });
    const unwired = apOptionCatalog
      .filter((option) => !option.locked)
      .map((option) => option.key)
      .filter((key) => overrides[key] === undefined);
    expect(unwired).toEqual([]);
  });

  it('lists each row once — a row with its own block stays out of the plain list', () => {
    const { unlocked } = partitionCatalogByLock(apOptionCatalog, AP_OPTION_GROUPS);
    const keys = unlocked.map((option) => option.key);
    expect(keys.filter((key) => SHOP_PRICE_BLOCK_KEYS.includes(key))).toEqual([]);
    expect(keys.filter((key) => SHOP_SCOPE_OPTION_KEYS.includes(key))).toEqual([]);
    expect(keys.filter((key) => DARK_ROOM_OPTION_KEYS.includes(key))).toEqual([]);
    expect(keys.filter((key) => DIFFICULTY_OPTION_KEYS.includes(key))).toEqual([]);
  });
});

/**
 * The whole shop scope, ticked and shuffled — the choice every case below
 * varies. One purchase per slot, so a slot is one location in the counts; the
 * fresh-profile scope stocks two, which the depth case sets for itself.
 */
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
