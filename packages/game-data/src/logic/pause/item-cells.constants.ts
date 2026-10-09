/* @layer shared-game @kind constants */
const ITEM_SLOT_COUNT = 20;
const BOTTLE_COUNT = 4;
const ITEM_CELL_COUNT = ITEM_SLOT_COUNT + BOTTLE_COUNT;
const FIRST_BOTTLE_HUD_ITEM = 21;
const LAST_HUD_ITEM = 24;
const BOTTLE_SAVE_INDEX = 15;
const SPLIT_SAVE_INDEX = 12;
const INSTRUMENT_HUD_ITEM = 13;
const TOOL_HUD_ITEM = 16;
const PLAIN_BOTTLE_RECORD = 'item-023';

const NEW_STYLE_SAVE_SLOTS: readonly number[] = [
  0, 1, 2, 3, 4, 5,
  6, 7, 8, 9, 10, 11,
  12, 13, 14, 12, 16, 17,
  18, 19,
];

const BASE_RECORDS: readonly string[] = [
  'item-012', 'item-013', 'item-011', 'item-041', 'item-042', 'item-008',
  'item-009', 'item-016', 'item-017', 'item-018', 'item-019', 'item-010',
  'item-021', 'item-034', 'item-030', 'item-020', 'item-022', 'item-025',
  'item-026', 'item-027',
];

const VALUE_RECORDS: Record<number, Record<number, string>> = {
  0: { 1: 'item-078', 3: 'item-060', 4: 'item-060' },
  1: { 2: 'item-043' },
  4: { 2: 'item-014' },
};

const BOTTLE_RECORDS: Record<number, string> = {
  1: 'item-023', 2: 'item-023', 3: 'item-044', 4: 'item-045',
  5: 'item-046', 6: 'item-062', 7: 'item-061', 8: 'item-073',
};

const RECORD_SPRITE_FALLBACKS: Record<string, string> = {
  'item-041': 'hud-bombs',
  'item-078': 'hud-bow-no-arrows',
};

export {
  BASE_RECORDS, BOTTLE_COUNT, BOTTLE_RECORDS, BOTTLE_SAVE_INDEX, FIRST_BOTTLE_HUD_ITEM, INSTRUMENT_HUD_ITEM,
  ITEM_CELL_COUNT, ITEM_SLOT_COUNT, LAST_HUD_ITEM, NEW_STYLE_SAVE_SLOTS, PLAIN_BOTTLE_RECORD, RECORD_SPRITE_FALLBACKS,
  SPLIT_SAVE_INDEX, TOOL_HUD_ITEM, VALUE_RECORDS,
};
