/* @layer renderer-widgets @kind constants */
import { BottleContents, cheatSetArrows, cheatSetBombs, cheatSetRupees, cheatSetSmallKeys } from '@app/lib/game';
import type { ControlHint } from '../../sub-components/ControlHint.type';
import type { BottleOption, BottleSlot, CounterSpec } from './PlayerTab.type';

const PLAYER_TILES_WIDE = 16;

const KEYS_MAX = 99;

const COUNT_STEPS = [1, 5, 10] as const;
const RUPEE_STEPS = [1, 10, 100] as const;

const LADDER_CHIP_LIMIT = 12;

const COUNTERS: readonly CounterSpec[] = [
  { kind: 'rupees', label: 'Rupees', iconWidth: 8, digits: 3, steps: RUPEE_STEPS, capacity: 'wallet' },
  { kind: 'bombs', label: 'Bombs', iconWidth: 16, digits: 2, steps: COUNT_STEPS, capacity: 'bombs' },
  { kind: 'arrows', label: 'Arrows', iconWidth: 16, digits: 2, steps: COUNT_STEPS, capacity: 'arrows' },
  { kind: 'keys', label: 'Keys', iconWidth: 8, digits: 1, steps: COUNT_STEPS },
];

const KEYS_HIDDEN = 255;

const MAGIC_LEVEL_LABELS: Record<number, string> = { 0: 'None', 1: 'Full', 2: '1/2', 3: '1/4' };

const BOTTLE_SLOTS: readonly BottleSlot[] = [0, 1, 2, 3];

const BOTTLE_ITEM_SLOT = 15;

const BOTTLE_OPTIONS: readonly BottleOption[] = [
  { value: BottleContents.None, label: 'None', tone: 'remove' },
  { value: BottleContents.Empty, label: 'Empty', tone: 'set' },
  { value: BottleContents.RedPotion, label: 'Red potion', tone: 'set' },
  { value: BottleContents.GreenPotion, label: 'Green potion', tone: 'set' },
  { value: BottleContents.BluePotion, label: 'Blue potion', tone: 'set' },
  { value: BottleContents.Fairy, label: 'Fairy', tone: 'set' },
  { value: BottleContents.Bee, label: 'Bee', tone: 'set' },
  { value: BottleContents.GoodBee, label: 'Good bee', tone: 'set' },
];

const LIFE_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: 'set health here (left half: half heart)' },
  { glyph: 'mouse-right', label: 'set the containers here' },
];
const MAGIC_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: 'set the meter here' },
  { glyph: 'wheel', label: 'one level up or down' },
  { glyph: 'mouse-right', label: 'set by steps' },
];
const MAGIC_LEVEL_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: 'next level' },
  { glyph: 'wheel', label: 'level up or down' },
  { glyph: 'mouse-right', label: 'pick a level' },
];
const NUMBER_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: 'type a value' },
  { glyph: 'wheel', label: 'one up or down' },
  { glyph: 'mouse-right', label: 'set by steps' },
];
const BOTTLE_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: 'choose the contents' },
];
const LEGEND: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: 'set a value where you click, or type it' },
  { glyph: 'mouse-right', label: 'containers on a heart; steps on a number' },
  { glyph: 'wheel', label: 'one up or down on a number or the meter' },
  { glyph: 'key', keyName: 'enter', label: 'commit a typed value' },
  { glyph: 'key', keyName: 'esc', label: 'cancel typing, close a box' },
];

const SNES_TILE = 8;
const HEART_UNITS = 8;
const HALF_HEART = HEART_UNITS / 2;
const HEART_CELLS = 20;
const HEART_COLUMNS = 10;

const BOTTLE_TILES = 2;
const BOTTLE_GAP_TILES = 1;
const BOTTLE_INNER_COLS = BOTTLE_GAP_TILES + BOTTLE_SLOTS.length * (BOTTLE_TILES + BOTTLE_GAP_TILES);
const BOTTLE_INNER_ROWS = BOTTLE_TILES + BOTTLE_GAP_TILES * 2;

const SILVER_BOW = 3;
const WIDE_WALLET = 999;
const COUNTER_WRITERS = {
  rupees: cheatSetRupees, bombs: cheatSetBombs, arrows: cheatSetArrows, keys: cheatSetSmallKeys,
} as const;
const COUNTER_ICONS = {
  rupees: 'hud-rupee-icon', bombs: 'hud-bomb-icon', arrows: 'hud-arrow-icon', keys: 'hud-key-icon',
} as const;

const MAGIC_LEVELS = 16;
const MAGIC_UNITS_PER_LEVEL = 8;
const MAGIC_FRAME_COLS = 3;
const MAGIC_FRAME_ROWS = 6;
const MAGIC_INTERIOR_INSET = 0.8;
const MAGIC_SETTER_STEPS = [1, 4];
const LEVEL_GAP_PX = 1;

export {
  BOTTLE_GAP_TILES, BOTTLE_HINTS, BOTTLE_INNER_COLS, BOTTLE_INNER_ROWS, BOTTLE_ITEM_SLOT, BOTTLE_OPTIONS, BOTTLE_SLOTS, BOTTLE_TILES,
  COUNTER_ICONS, COUNTER_WRITERS, COUNTERS, HALF_HEART, HEART_CELLS, HEART_COLUMNS, HEART_UNITS, KEYS_HIDDEN, KEYS_MAX, LADDER_CHIP_LIMIT,
  LEGEND, LEVEL_GAP_PX, LIFE_HINTS, MAGIC_FRAME_COLS, MAGIC_FRAME_ROWS, MAGIC_HINTS, MAGIC_INTERIOR_INSET, MAGIC_LEVEL_HINTS,
  MAGIC_LEVEL_LABELS, MAGIC_LEVELS, MAGIC_SETTER_STEPS, MAGIC_UNITS_PER_LEVEL, NUMBER_HINTS, PLAYER_TILES_WIDE, SILVER_BOW, SNES_TILE,
  WIDE_WALLET,
};
