/* @layer bridge-wasm @kind constants */
import {
  CREDITS_DIGITS_ID, CREDITS_MAP_ID, CREDITS_OFFSETS_ID, CREDITS_SCROLL_Y_ID, CREDITS_TEXT_ID, DUNGEON_MAP_LABELS_ID,
  ENDING_CAPTION_DATA_ID, ENDING_CAPTION_OFFSETS_ID, NAME_GRID_ID, PAUSE_TABLES, SELECT_FILE_TABLES,
  SELECT_PALETTE_ID, TILEMAP_FONT_DATA_ID, menuTilemapId, pauseTableId, selectFileTableId,
} from '@rotp/asset-extraction';
import type { PauseTable } from '@rotp/asset-extraction';

const C_ASSET_BASE = 0x40;

const C_SELECT_FILE_BASE = 10;

const C_NAME_GRID = 18;

const C_DUNGEON_MAP_LABELS = 19;

const C_CREDITS_DIGITS = 20;

const C_CREDITS_SCROLL_Y = 21;

const C_SELECT_PALETTE = 22;

const C_TILEMAP_FONT_DATA = 0x80;

const C_MENU_TILEMAP_SLOT = 5;

const MENU_TILEMAP_COUNT = 6;

const SHEET_ID_MIN = 0x100;

const C_PAUSE_IDS: Readonly<Record<PauseTable, number>> = {
  ability: 0, gloves: 1, bottles: 2, mushroom: 3, flute: 4, mirror: 5, bow: 6, items: 7, dungeonItems: 9,
};

const cAssetId = (slot: number): number => C_ASSET_BASE + slot;

const buildTableIds = (): ReadonlyMap<number, number> => {
  const map = new Map<number, number>([
    [NAME_GRID_ID, C_NAME_GRID],
    [DUNGEON_MAP_LABELS_ID, C_DUNGEON_MAP_LABELS],
    [CREDITS_DIGITS_ID, C_CREDITS_DIGITS],
    [CREDITS_SCROLL_Y_ID, C_CREDITS_SCROLL_Y],
    [SELECT_PALETTE_ID, C_SELECT_PALETTE],
    [TILEMAP_FONT_DATA_ID, C_TILEMAP_FONT_DATA],
    [CREDITS_TEXT_ID, cAssetId(0)],
    [CREDITS_OFFSETS_ID, cAssetId(1)],
    [CREDITS_MAP_ID, cAssetId(2)],
    [ENDING_CAPTION_OFFSETS_ID, cAssetId(3)],
    [ENDING_CAPTION_DATA_ID, cAssetId(4)],
  ]);
  for (let i = 0; i < MENU_TILEMAP_COUNT; i++) map.set(menuTilemapId(i), cAssetId(C_MENU_TILEMAP_SLOT + i));
  SELECT_FILE_TABLES.forEach((table, i) => map.set(selectFileTableId(table), C_SELECT_FILE_BASE + i));
  PAUSE_TABLES.forEach((table) => map.set(pauseTableId(table), C_PAUSE_IDS[table]));
  return map;
};

const C_TABLE_IDS: ReadonlyMap<number, number> = buildTableIds();

export { C_TABLE_IDS, SHEET_ID_MIN };
