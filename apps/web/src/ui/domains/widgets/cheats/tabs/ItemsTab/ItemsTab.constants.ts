/* @layer renderer-widgets @kind constants */
import { CheatSlot } from '@app/lib/game';
import type { ControlHint } from '../../sub-components/ControlHint.type';
import type { DungeonItem, EquipmentBytes, GearSlot, SlotName } from './ItemsTab.type';

const ITEMS_TILES_WIDE = 21;

const RAW_VALUE_LABELS: Record<number, Record<number, string>> = {
  0: { 1: 'Bow', 2: 'Bow & Arrows', 3: 'Silver Bow', 4: 'Silver Bow & Arrows' },
  12: { 3: 'Flute (active)' },
  19: { 1: 'Magic Scroll' },
  [CheatSlot.Armor]: { 0: 'Green Mail' },
};

const BOW_RUNG_VALUES = [1, 3];
const BOW_TOP_VALUE = 4;
const MIRROR_SLOT_INDEX = 19;
const BOOK_SLOT_INDEX = 14;

const BOTTLE_SLOT_INDEX = 15;
const BOTTLE_NOTICE = 'Bottles are on the Player tab';
const EMPTY_BOTTLE = 2;

const ITEM_GRID = { cols: 17, rows: 13, gridCols: 5, gridRows: 4, top: 1, left: 2 };
const ITEM_SLOT_COUNT = ITEM_GRID.gridCols * ITEM_GRID.gridRows;

const EQUIP_PANEL = { cols: 8, rows: 7, itemRow: 1, ruleRow: 3, labelRow: 4, bottomRow: 5 };
const EQUIP_COLUMNS = { sword: 0, shield: 3, armor: 6 };
const DUNGEON_ITEM_COLUMNS = { map: 0, compass: 3, bigKey: 6 };
const HEART_PIECE_COLUMN = 3;
const HEART_PIECE_MAX = 3;
const NOT_IN_DUNGEON = 0xff;

const PROGRESS_PANEL = { cols: 7, rows: 7 };
const PENDANT_SPOTS = [
  { bit: 4, x: 2.5, y: 2, variant: 'green', name: 'Pendant of Courage' },
  { bit: 2, x: 0.5, y: 5, variant: 'blue', name: 'Pendant of Wisdom' },
  { bit: 1, x: 4.5, y: 5, variant: 'red', name: 'Pendant of Power' },
] as const;
const CRYSTAL_SPOTS = [
  { x: 1.5, y: 2 }, { x: 3.5, y: 2 },
  { x: 0.5, y: 4 }, { x: 2.5, y: 4 }, { x: 4.5, y: 4 },
  { x: 1.5, y: 6 }, { x: 3.5, y: 6 },
];
const CRYSTALS_FROM_PROGRESS = 3;

const ABILITY_PANEL = { cols: 17, rows: 7, textTop: 2 / 3, textWidth: 16.7, textRows: 4, slotRow: 5, left: 2, width: 14 };
const ABILITY_WORDS = [
  { label: 'LIFT', bit: 7 }, { label: 'READ', bit: 6 }, { label: 'TALK', bit: 5 },
  { label: 'PULL', bit: 3 }, { label: 'RUN', bit: 2 }, { label: 'SWIM', bit: 1 },
];
const ABILITY_SLOT_ORDER = [CheatSlot.Boots, CheatSlot.Gloves, CheatSlot.Flippers, CheatSlot.MoonPearl];
const ABILITY_EQUIP_TYPE: Record<number, string> = {
  [CheatSlot.Boots]: 'boots', [CheatSlot.Gloves]: 'gloves', [CheatSlot.Flippers]: 'flippers', [CheatSlot.MoonPearl]: 'moonPearl',
};
const ABILITY_FLAG_LIFT = 0x80;
const ABILITY_FLAG_READ_TALK = 0x60;
const ABILITY_FLAG_PULL = 0x08;
const ABILITY_FLAG_RUN = 0x04;
const ABILITY_FLAG_SWIM = 0x02;

const EQUIPMENT_KEY: Record<number, keyof EquipmentBytes> = {
  [CheatSlot.Gloves]: 'gloves', [CheatSlot.Boots]: 'boots', [CheatSlot.Flippers]: 'flippers',
  [CheatSlot.MoonPearl]: 'moonPearl', [CheatSlot.Sword]: 'sword', [CheatSlot.Shield]: 'shield',
  [CheatSlot.Armor]: 'armor',
};

const GEAR: GearSlot[] = [
  { slot: CheatSlot.Sword, type: 'sword', col: EQUIP_COLUMNS.sword },
  { slot: CheatSlot.Shield, type: 'shield', col: EQUIP_COLUMNS.shield },
  { slot: CheatSlot.Armor, type: 'armor', col: EQUIP_COLUMNS.armor },
];

const DUNGEON_ITEMS: DungeonItem[] = [
  { kind: 'map', type: 'dungeonMap', col: DUNGEON_ITEM_COLUMNS.map, label: 'Map' },
  { kind: 'compass', type: 'compass', col: DUNGEON_ITEM_COLUMNS.compass, label: 'Compass' },
  { kind: 'bigKey', type: 'bigKey', col: DUNGEON_ITEM_COLUMNS.bigKey, label: 'Big Key' },
];

const EMPTY_NAME: SlotName = { lines: [''], sprite: null, owned: false };

const CHEAT_SOURCE = 'cheat';

const PICK_ROW: ControlHint = { glyph: 'mouse-right', label: 'pick a tier' };
const GIVE_HINT: readonly ControlHint[] = [{ glyph: 'mouse-left', label: 'give it' }, PICK_ROW];
const TIERS_HINT: readonly ControlHint[] = [{ glyph: 'mouse-left', label: 'open its tiers' }, PICK_ROW];
const TOGGLE_HINT: readonly ControlHint[] = [{ glyph: 'mouse-left', label: 'toggle it' }];

export {
  ABILITY_EQUIP_TYPE, ABILITY_FLAG_LIFT, ABILITY_FLAG_PULL, ABILITY_FLAG_READ_TALK, ABILITY_FLAG_RUN, ABILITY_FLAG_SWIM, ABILITY_PANEL,
  ABILITY_SLOT_ORDER, ABILITY_WORDS, BOOK_SLOT_INDEX, BOTTLE_NOTICE, BOTTLE_SLOT_INDEX, BOW_RUNG_VALUES, BOW_TOP_VALUE, CHEAT_SOURCE,
  CRYSTAL_SPOTS, CRYSTALS_FROM_PROGRESS, DUNGEON_ITEM_COLUMNS, DUNGEON_ITEMS, EMPTY_BOTTLE, EMPTY_NAME, EQUIP_COLUMNS, EQUIP_PANEL,
  EQUIPMENT_KEY, GEAR, GIVE_HINT, HEART_PIECE_COLUMN, HEART_PIECE_MAX, ITEM_GRID, ITEM_SLOT_COUNT, ITEMS_TILES_WIDE, MIRROR_SLOT_INDEX,
  NOT_IN_DUNGEON, PENDANT_SPOTS, PROGRESS_PANEL, RAW_VALUE_LABELS, TIERS_HINT, TOGGLE_HINT,
};
