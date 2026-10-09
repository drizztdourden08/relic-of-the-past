/* @layer shared-game @kind logic */
import { getItem } from '@shared/game/data';
import { spriteFilename } from '@shared/game/logic/queries/item-sprites';
import type { ItemCell, PauseNameKey } from './pause.type';
import {
  BASE_RECORDS, BOTTLE_COUNT, BOTTLE_RECORDS, BOTTLE_SAVE_INDEX, FIRST_BOTTLE_HUD_ITEM, ITEM_SLOT_COUNT,
  NEW_STYLE_SAVE_SLOTS, PLAIN_BOTTLE_RECORD, RECORD_SPRITE_FALLBACKS, SPLIT_SAVE_INDEX, TOOL_HUD_ITEM, VALUE_RECORDS,
} from './item-cells.constants';

const spriteOf = (recordId: string): string =>
  RECORD_SPRITE_FALLBACKS[recordId] ?? spriteFilename(getItem(recordId).spriteId) ?? '';

const isSplitCellOwned = (hudItem: number, value: number): boolean =>
  hudItem === TOOL_HUD_ITEM ? value >= 1 : value >= 2;

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
    sprite: spriteOf(owned ? (BOTTLE_RECORDS[value] ?? PLAIN_BOTTLE_RECORD) : PLAIN_BOTTLE_RECORD),
    owned,
    nameKey: owned ? { kind: 'bottle', value } : { kind: 'item', recordId: PLAIN_BOTTLE_RECORD, tier: 1 },
  };
};

const buildItemCells = (items: readonly number[], bottles: readonly number[]): ItemCell[] => [
  ...Array.from({ length: ITEM_SLOT_COUNT }, (_, i) => buildInventoryCell(i, items)),
  ...Array.from({ length: BOTTLE_COUNT }, (_, i) => buildBottleCell(i, bottles)),
];

export { buildItemCells };
