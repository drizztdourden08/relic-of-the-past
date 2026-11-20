/* @layer renderer-widgets @kind constants */
import { BottleContents, cheatSetArrows, cheatSetBombs, cheatSetRupees, cheatSetSmallKeys } from '@app/game';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ControlHint } from '../ControlHint.type';
import type { BottleOption, BottleSlot, CounterSpec } from './PlayerTab.type';

const PLAYER_TILES_WIDE = 16;

const KEYS_MAX = 99;

const COUNT_STEPS = [1, 5, 10] as const;
const RUPEE_STEPS = [1, 10, 100] as const;

const COUNTERS: readonly CounterSpec[] = [
  { kind: 'rupees', label: msg('views-cheats:counter.rupees'), iconWidth: 8, digits: 3, steps: RUPEE_STEPS, capacity: 'wallet' },
  { kind: 'bombs', label: msg('views-cheats:counter.bombs'), iconWidth: 16, digits: 2, steps: COUNT_STEPS, capacity: 'bombs' },
  { kind: 'arrows', label: msg('views-cheats:counter.arrows'), iconWidth: 16, digits: 2, steps: COUNT_STEPS, capacity: 'arrows' },
  { kind: 'keys', label: msg('views-cheats:counter.keys'), iconWidth: 8, digits: 1, steps: COUNT_STEPS },
];

const KEYS_HIDDEN = 255;

const MAGIC_LEVEL_LABELS: Record<number, Message> = {
  0: msg('views-cheats:magic.none'),
  1: msg('views-cheats:magic.full'),
  2: msg('views-cheats:magic.half'),
  3: msg('views-cheats:magic.quarter'),
};

const BOTTLE_SLOTS: readonly BottleSlot[] = [0, 1, 2, 3];

const BOTTLE_ITEM_SLOT = 15;

const BOTTLE_OPTIONS: readonly BottleOption[] = [
  { value: BottleContents.None, label: msg('views-cheats:bottle.contents.none'), tone: 'remove' },
  { value: BottleContents.Empty, label: msg('views-cheats:bottle.contents.empty'), tone: 'set' },
  { value: BottleContents.RedPotion, label: msg('views-cheats:bottle.contents.red-potion'), tone: 'set' },
  { value: BottleContents.GreenPotion, label: msg('views-cheats:bottle.contents.green-potion'), tone: 'set' },
  { value: BottleContents.BluePotion, label: msg('views-cheats:bottle.contents.blue-potion'), tone: 'set' },
  { value: BottleContents.Fairy, label: msg('views-cheats:bottle.contents.fairy'), tone: 'set' },
  { value: BottleContents.Bee, label: msg('views-cheats:bottle.contents.bee'), tone: 'set' },
  { value: BottleContents.GoodBee, label: msg('views-cheats:bottle.contents.good-bee'), tone: 'set' },
];

const LIFE_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: msg('views-cheats:hint.life.set') },
  { glyph: 'mouse-right', label: msg('views-cheats:hint.life.containers') },
];
const MAGIC_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: msg('views-cheats:hint.magic.meter') },
  { glyph: 'wheel', label: msg('views-cheats:hint.magic.wheel') },
  { glyph: 'mouse-right', label: msg('views-cheats:hint.setBySteps') },
];
const MAGIC_LEVEL_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: msg('views-cheats:hint.level.next') },
  { glyph: 'wheel', label: msg('views-cheats:hint.level.wheel') },
  { glyph: 'mouse-right', label: msg('views-cheats:hint.level.pick') },
];
const NUMBER_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: msg('views-cheats:hint.number.type') },
  { glyph: 'wheel', label: msg('views-cheats:hint.number.wheel') },
  { glyph: 'mouse-right', label: msg('views-cheats:hint.setBySteps') },
];
const BOTTLE_HINTS: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: msg('views-cheats:hint.bottle.choose') },
];
const LEGEND: readonly ControlHint[] = [
  { glyph: 'mouse-left', label: msg('views-cheats:legend.set') },
  { glyph: 'mouse-right', label: msg('views-cheats:legend.right') },
  { glyph: 'wheel', label: msg('views-cheats:legend.wheel') },
  { glyph: 'key', keyName: 'enter', label: msg('views-cheats:legend.enter') },
  { glyph: 'key', keyName: 'esc', label: msg('views-cheats:legend.esc') },
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
  COUNTER_ICONS, COUNTER_WRITERS, COUNTERS, HALF_HEART, HEART_CELLS, HEART_COLUMNS, HEART_UNITS, KEYS_HIDDEN, KEYS_MAX,
  LEGEND, LEVEL_GAP_PX, LIFE_HINTS, MAGIC_FRAME_COLS, MAGIC_FRAME_ROWS, MAGIC_HINTS, MAGIC_INTERIOR_INSET, MAGIC_LEVEL_HINTS,
  MAGIC_LEVEL_LABELS, MAGIC_LEVELS, MAGIC_SETTER_STEPS, MAGIC_UNITS_PER_LEVEL, NUMBER_HINTS, PLAYER_TILES_WIDE, SILVER_BOW, SNES_TILE,
  WIDE_WALLET,
};
