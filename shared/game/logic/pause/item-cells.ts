/* @layer shared-game @kind logic */
/**
 * The 24-cell pause item grid, six columns by four rows.
 *
 * The cells are the twenty inventory save slots with the two changes the core's
 * new-style lookup makes: the digging tool and the wind instrument share one
 * save slot but get a cell each, and the single "current bottle" slot is
 * replaced by four bottle cells. 20 + 1 - 1 + 4 = 24. Cell order is the core's
 * new-style hud-item order (ids 1..24), never the save order. Id 13 is the
 * instrument, id 16 the digging tool, ids 21..24 the four bottles. The ids are
 * derived from the core's own new-style table, not invented here.
 *
 * SILHOUETTE RULE. An unowned cell still carries a sprite: the TIER-ONE sprite
 * for that slot, with `owned: false`. The renderer draws it as a flat
 * silhouette. This is deliberate. The outline says "something goes here"
 * without revealing which upgrade tier is still out in the world: drawing the
 * real tier would leak progression into a menu the player opens constantly, and
 * drawing nothing would leave the grid unreadable. The name key follows the
 * same rule, so an unowned cell names its tier-one record, never its upgrade.
 *
 * Sprite filenames are resolved through the record dataset (`spriteId`), so the
 * names stay in the data layer where they belong. The only literals here are
 * the two variants the dataset carries no sprite for.
 */
import { getItem } from '@shared/game/data';
import { spriteFilename } from '@shared/game/logic/queries/item-sprites';

/** A key into the pause name table: items are `<recordId>-<tier>`, bottles by value. */
type PauseNameKey =
  | { kind: 'item'; recordId: string; tier: number }
  | { kind: 'bottle'; value: number };

interface ItemCell {
  /** Core new-style hud-item id, 1..24. */
  hudItem: number;
  /** Inventory save slot this cell reads (15 for every bottle cell). */
  saveIndex: number;
  /** Sprite filename, always populated. Tier-one art when `owned` is false. */
  sprite: string;
  owned: boolean;
  nameKey: PauseNameKey;
}

const ITEM_SLOT_COUNT = 20;
const BOTTLE_COUNT = 4;
const ITEM_CELL_COUNT = ITEM_SLOT_COUNT + BOTTLE_COUNT;
const FIRST_BOTTLE_HUD_ITEM = 21;
const BOTTLE_SAVE_INDEX = 15;
const SPLIT_SAVE_INDEX = 12;
const INSTRUMENT_HUD_ITEM = 13;
const TOOL_HUD_ITEM = 16;

/** Save slot per hud-item id 1..20, in the core's new-style order. */
const NEW_STYLE_SAVE_SLOTS: readonly number[] = [
  0, 1, 2, 3, 4, 5,
  6, 7, 8, 9, 10, 11,
  12, 13, 14, 12, 16, 17,
  18, 19,
];

/** Tier-one record per hud-item id 1..20, used for the silhouette and the fallback name. */
const BASE_RECORDS: readonly string[] = [
  'item-012', 'item-013', 'item-011', 'item-041', 'item-042', 'item-008',
  'item-009', 'item-016', 'item-017', 'item-018', 'item-019', 'item-010',
  'item-021', 'item-034', 'item-030', 'item-020', 'item-022', 'item-025',
  'item-026', 'item-027',
];

/** Save slot → stored value → the record whose sprite that value shows. */
const VALUE_RECORDS: Record<number, Record<number, string>> = {
  0: { 1: 'item-078', 3: 'item-060', 4: 'item-060' },
  1: { 2: 'item-043' },
  4: { 2: 'item-014' },
};

/** Bottle content value → record. Value 1 and 2 both draw the plain bottle. */
const BOTTLE_RECORDS: Record<number, string> = {
  1: 'item-023', 2: 'item-023', 3: 'item-044', 4: 'item-045',
  5: 'item-046', 6: 'item-062', 7: 'item-061', 8: 'item-073',
};

/** Records the dataset holds without a sprite of their own. */
const RECORD_SPRITE_FALLBACKS: Record<string, string> = {
  'item-041': 'hud-bombs',
  'item-078': 'hud-bow-no-arrows',
};

const spriteOf = (recordId: string): string =>
  RECORD_SPRITE_FALLBACKS[recordId] ?? spriteFilename(getItem(recordId).spriteId) ?? '';

/** Hud-item id for a cursor position, or null when the cell does not exist. */
const hudItemAt = (section: 'items' | 'bottles', cursor: number): number | null => {
  if (!Number.isInteger(cursor) || cursor < 0) return null;
  if (section === 'items') return cursor < ITEM_SLOT_COUNT ? cursor + 1 : null;
  return cursor < BOTTLE_COUNT ? FIRST_BOTTLE_HUD_ITEM + cursor : null;
};

/**
 * The two cells that share save slot 12. The thresholds are the core's, not
 * ours: under the new-style lookup it answers the tool for any value at or
 * above one and the instrument only from two up, so the tool stays owned after
 * the trade that raises the slot. Reading the tool as `value === 1` instead
 * would silhouette a cell the core would still let the player equip, which is
 * the one disagreement this grid must never have with the register it drives.
 */
const isSplitCellOwned = (hudItem: number, value: number): boolean =>
  hudItem === TOOL_HUD_ITEM ? value >= 1 : value >= 2;

/** Item-screen name rules, matching the tiers the name table is keyed by. */
const nameKeyFor = (saveIndex: number, base: string, value: number, owned: boolean): PauseNameKey => {
  if (!owned) return { kind: 'item', recordId: base, tier: 1 };
  if (saveIndex === 0 && value >= 4) return { kind: 'item', recordId: 'item-012', tier: 2 };
  if (saveIndex === 4 && value >= 2) return { kind: 'item', recordId: 'item-014', tier: 1 };
  return { kind: 'item', recordId: base, tier: 1 };
};

const buildInventoryCell = (index: number, items: readonly number[]): ItemCell => {
  const hudItem = index + 1;
  const saveIndex = NEW_STYLE_SAVE_SLOTS[index];
  const base = BASE_RECORDS[index];
  const value = items[saveIndex] ?? 0;
  const split = saveIndex === SPLIT_SAVE_INDEX;
  const owned = split ? isSplitCellOwned(hudItem, value) : value > 0;
  const record = split ? base : (owned ? (VALUE_RECORDS[saveIndex]?.[value] ?? base) : base);
  return {
    hudItem,
    saveIndex,
    sprite: spriteOf(record),
    owned,
    nameKey: split ? { kind: 'item', recordId: base, tier: 1 } : nameKeyFor(saveIndex, base, value, owned),
  };
};

const buildBottleCell = (index: number, bottles: readonly number[]): ItemCell => {
  const value = bottles[index] ?? 0;
  const owned = value > 0;
  return {
    hudItem: FIRST_BOTTLE_HUD_ITEM + index,
    saveIndex: BOTTLE_SAVE_INDEX,
    sprite: spriteOf(owned ? (BOTTLE_RECORDS[value] ?? 'item-023') : 'item-023'),
    owned,
    nameKey: owned ? { kind: 'bottle', value } : { kind: 'item', recordId: 'item-023', tier: 1 },
  };
};

/**
 * Builds all 24 cells from the live inventory. `items` is the 20-entry save
 * array, `bottles` the 4-entry one; both are read defensively so a short array
 * yields unowned cells instead of throwing.
 */
const buildItemCells = (items: readonly number[], bottles: readonly number[]): ItemCell[] => [
  ...Array.from({ length: ITEM_SLOT_COUNT }, (_, i) => buildInventoryCell(i, items)),
  ...Array.from({ length: BOTTLE_COUNT }, (_, i) => buildBottleCell(i, bottles)),
];

export {
  BOTTLE_COUNT,
  FIRST_BOTTLE_HUD_ITEM,
  INSTRUMENT_HUD_ITEM,
  ITEM_CELL_COUNT,
  ITEM_SLOT_COUNT,
  TOOL_HUD_ITEM,
  buildItemCells,
  hudItemAt,
};
export type { ItemCell, PauseNameKey };
