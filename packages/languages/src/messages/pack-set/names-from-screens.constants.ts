/* @layer shared-game @kind constants */
import type { ItemSlot } from './names-from-screens.type';

const WORDS_PER_ENTRY = 16;

const TILE_MASK = 0x3ff;

const SPACE_TILE = 0xf5;

const LETTER_FIRST_TILE = 0x150;

const LETTER_COUNT = 26;

const HYPHEN_TILE = 0x16a;

const ITEM_SLOTS: readonly ItemSlot[] = [
  { table: 'items', entry: 2, key: 'item-011-1' },
  { table: 'items', entry: 3, key: 'item-041-1' },
  { table: 'items', entry: 4, key: 'item-042-1' },
  { table: 'items', entry: 5, key: 'item-008-1' },
  { table: 'items', entry: 6, key: 'item-009-1' },
  { table: 'items', entry: 7, key: 'item-016-1' },
  { table: 'items', entry: 8, key: 'item-017-1' },
  { table: 'items', entry: 9, key: 'item-018-1' },
  { table: 'items', entry: 10, key: 'item-019-1' },
  { table: 'items', entry: 11, key: 'item-010-1' },
  { table: 'items', entry: 12, key: 'item-020-1' },
  { table: 'items', entry: 14, key: 'item-030-1' },
  { table: 'items', entry: 16, key: 'item-022-1' },
  { table: 'items', entry: 17, key: 'item-025-1' },
  { table: 'items', entry: 18, key: 'item-026-1' },
  { table: 'mushroom', entry: 0, key: 'item-014-1' },
  { table: 'flute', entry: 0, key: 'item-021-1' },
  { table: 'mirror', entry: 0, key: 'item-027-1' },
];

const FIRST_BOTTLE_CONTENT = 2;

const FIRST_BOTTLE_ENTRY = 1;

const BOTTLE_COUNT = 7;

export {
  BOTTLE_COUNT, FIRST_BOTTLE_CONTENT, FIRST_BOTTLE_ENTRY, HYPHEN_TILE, ITEM_SLOTS, LETTER_COUNT, LETTER_FIRST_TILE,
  SPACE_TILE, TILE_MASK, WORDS_PER_ENTRY,
};
