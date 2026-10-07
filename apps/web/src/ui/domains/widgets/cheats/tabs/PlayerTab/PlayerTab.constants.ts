/* @layer renderer-widgets @kind constants */
import { BottleContents } from '@app/lib/game';
import type { BottleContentsValue, CapacityKind } from '@app/lib/game';
import type { ChoiceTone } from '../../sub-components/ChoicePopover.type';
import type { ControlHint } from '../../sub-components/ControlGlyph.type';

/** The widest block: the ten-heart life meter with a little room either side. */
const PLAYER_TILES_WIDE = 16;

/** Small keys have no capacity byte; a single digit is what the HUD draws. */
const KEYS_MAX = 99;

/** The amounts a counted value's setter moves by. */
const COUNT_STEPS = [1, 5, 10] as const;
const RUPEE_STEPS = [1, 10, 100] as const;

/** A ladder longer than this is walked by steps, not shown as chips (the wallet's 101 rungs). */
const LADDER_CHIP_LIMIT = 12;

type CounterKind = 'rupees' | 'bombs' | 'arrows' | 'keys';

type CounterSpec = {
  kind: CounterKind;
  label: string;
  /** Icon sprite width in SNES pixels. */
  iconWidth: 8 | 16;
  digits: number;
  steps: readonly number[];
  /** The capacity family behind the max; absent when the max is not the console's to set. */
  capacity?: CapacityKind;
};

const COUNTERS: readonly CounterSpec[] = [
  { kind: 'rupees', label: 'Rupees', iconWidth: 8, digits: 3, steps: RUPEE_STEPS, capacity: 'wallet' },
  { kind: 'bombs', label: 'Bombs', iconWidth: 16, digits: 2, steps: COUNT_STEPS, capacity: 'bombs' },
  { kind: 'arrows', label: 'Arrows', iconWidth: 16, digits: 2, steps: COUNT_STEPS, capacity: 'arrows' },
  { kind: 'keys', label: 'Keys', iconWidth: 8, digits: 1, steps: COUNT_STEPS },
];

/** The keys counter reads this when the player is outside a dungeon. */
const KEYS_HIDDEN = 255;

/** The meter's level codes, as the core reports them on the ladder. */
const MAGIC_LEVEL_LABELS: Record<number, string> = { 0: 'None', 1: 'Full', 2: '1/2', 3: '1/4' };

type BottleSlot = 0 | 1 | 2 | 3;
const BOTTLE_SLOTS: readonly BottleSlot[] = [0, 1, 2, 3];

/** The pause save byte index of the bottle slot, which the sprite table is keyed on. */
const BOTTLE_ITEM_SLOT = 15;

type BottleOption = {
  value: BottleContentsValue;
  label: string;
  tone: ChoiceTone;
};

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

/** What each control answers to, for the pointer hint and the legend. */
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
  { glyph: 'key', keyName: 'Enter', label: 'commit a typed value' },
  { glyph: 'key', keyName: 'Esc', label: 'cancel typing, close a box' },
];

export {
  PLAYER_TILES_WIDE, KEYS_MAX, KEYS_HIDDEN, COUNTERS, LADDER_CHIP_LIMIT, MAGIC_LEVEL_LABELS,
  BOTTLE_SLOTS, BOTTLE_ITEM_SLOT, BOTTLE_OPTIONS,
  LIFE_HINTS, MAGIC_HINTS, MAGIC_LEVEL_HINTS, NUMBER_HINTS, BOTTLE_HINTS, LEGEND,
};
export type { CounterKind, CounterSpec, BottleSlot, BottleOption };
