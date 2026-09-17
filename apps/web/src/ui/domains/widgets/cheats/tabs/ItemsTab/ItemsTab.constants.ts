/* @layer renderer-widgets @kind constants */
/**
 * Labels for slot values that no receive id names, and the tile geometry of each panel. The
 * geometry repeats the pause compounds' numbers so the editors land on the same pixels.
 */
import { CheatSlot } from '@app/lib/game';

/** `slot -> value -> label` for the bytes a receipt never writes on its own. */
const RAW_VALUE_LABELS: Record<number, Record<number, string>> = {
  0: { 1: 'Bow', 2: 'Bow & Arrows', 3: 'Silver Bow', 4: 'Silver Bow & Arrows' },
  12: { 3: 'Flute (active)' },
  19: { 1: 'Magic Scroll' },
  [CheatSlot.Armor]: { 0: 'Green Mail' },
};

/** The bow byte counts the arrows loaded on top of the bow held, so the two rungs sit at 1 and 3. */
const BOW_RUNG_VALUES = [1, 3];

/** Save index of the bottle-index slot, which the Player tab edits. */
const BOTTLE_SLOT_INDEX = 15;
const BOTTLE_NOTICE = 'Bottles are on the Player tab';

/** Green ITEM box: 17x13 inner tiles; the 5x4 grid starts one tile down and two across. */
const ITEM_GRID = { cols: 17, rows: 13, gridCols: 5, gridRows: 4, top: 1, left: 2 };

/** Yellow EQUIP box: sword, shield and armor along row 1; the dotted rule on row 3. */
const EQUIP_PANEL = { cols: 8, rows: 7, itemRow: 1, ruleRow: 3, labelRow: 4, bottomRow: 5 };
const EQUIP_COLUMNS = { sword: 0, shield: 3, armor: 6 };
const DUNGEON_ITEM_COLUMNS = { map: 0, compass: 3, bigKey: 6 };
const HEART_PIECE_COLUMN = 3;
const HEART_PIECE_MAX = 3;

/** Yellow PENDANTS / CRYSTALS box, one tile narrower than the game's so it fits beside EQUIP. */
const PROGRESS_PANEL = { cols: 7, rows: 7 };
/** Bit, tile position and colour of each pendant: courage on top, wisdom left, power right. */
const PENDANT_SPOTS = [
  { bit: 4, x: 2.5, y: 2, variant: 'green', name: 'Pendant of Courage' },
  { bit: 2, x: 0.5, y: 5, variant: 'blue', name: 'Pendant of Wisdom' },
  { bit: 1, x: 4.5, y: 5, variant: 'red', name: 'Pendant of Power' },
] as const;
/** Crystal N sits at index N, in the game's 2-3-2 layout. */
const CRYSTAL_SPOTS = [
  { x: 1.5, y: 2 }, { x: 3.5, y: 2 },
  { x: 0.5, y: 4 }, { x: 2.5, y: 4 }, { x: 4.5, y: 4 },
  { x: 1.5, y: 6 }, { x: 3.5, y: 6 },
];
/** The game shows crystals once the progress indicator reaches this. */
const CRYSTALS_FROM_PROGRESS = 3;

/** Red A box: the ability words in a 3x2 grid, the four passives along the bottom row. */
const ABILITY_PANEL = { cols: 17, rows: 7, textTop: 2 / 3, textWidth: 16.7, textRows: 4, slotRow: 5, left: 2, width: 14 };
/** Ability word, its bit in abilityFlags, and its cell in the 3x2 text grid. */
const ABILITY_WORDS = [
  { label: 'LIFT', bit: 7 }, { label: 'READ', bit: 6 }, { label: 'TALK', bit: 5 },
  { label: 'PULL', bit: 3 }, { label: 'RUN', bit: 2 }, { label: 'SWIM', bit: 1 },
];
/** The passives along the bottom row, in the game's order. */
const ABILITY_SLOT_ORDER = [CheatSlot.Boots, CheatSlot.Gloves, CheatSlot.Flippers, CheatSlot.MoonPearl];

export {
  ABILITY_PANEL, ABILITY_SLOT_ORDER, ABILITY_WORDS, BOTTLE_NOTICE, BOTTLE_SLOT_INDEX, BOW_RUNG_VALUES,
  CRYSTAL_SPOTS, CRYSTALS_FROM_PROGRESS, DUNGEON_ITEM_COLUMNS, EQUIP_COLUMNS, EQUIP_PANEL, HEART_PIECE_COLUMN,
  HEART_PIECE_MAX, ITEM_GRID, PENDANT_SPOTS, PROGRESS_PANEL, RAW_VALUE_LABELS,
};
