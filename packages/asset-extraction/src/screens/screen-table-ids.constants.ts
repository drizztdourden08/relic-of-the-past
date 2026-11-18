/* @layer shared-asset-extraction @kind constants */
import type { PauseTable, SelectFileTable, SheetKind } from './screen-payload.type';
import { PAUSE_TABLES, SELECT_FILE_TABLES } from './screens.constants';

const MENU_TILEMAP_BASE = 0;

const SELECT_FILE_BASE = 6;

const NAME_GRID_ID = 14;

const PAUSE_BASE = 15;

const DUNGEON_MAP_LABELS_ID = 24;

const ENDING_CAPTION_OFFSETS_ID = 25;

const ENDING_CAPTION_DATA_ID = 26;

const CREDITS_TEXT_ID = 27;

const CREDITS_OFFSETS_ID = 28;

const CREDITS_MAP_ID = 29;

const TILEMAP_FONT_ID = 30;

const TILEMAP_FONT_DATA_ID = 31;

const CREDITS_DIGITS_ID = 32;

const CREDITS_SCROLL_Y_ID = 33;

const PAUSE_HEADERS_ID = 34;

const FLOOR_LABELS_ID = 35;

const COPY_SCREEN_ID = 36;

const SHEET_PATCH_BASE = 0x300;

const SHEET_BASE: Readonly<Record<SheetKind, number>> = { spr: 0x100, bg: 0x200 };

const menuTilemapId = (index: number): number => MENU_TILEMAP_BASE + index;

const selectFileTableId = (table: SelectFileTable): number => SELECT_FILE_BASE + SELECT_FILE_TABLES.indexOf(table);

const pauseTableId = (table: PauseTable): number => PAUSE_BASE + PAUSE_TABLES.indexOf(table);

const sheetPatchTableId = (index: number): number => SHEET_PATCH_BASE + index;

const sheetTableId = (kind: SheetKind, index: number): number => SHEET_BASE[kind] + index;

export {
  COPY_SCREEN_ID, CREDITS_DIGITS_ID, CREDITS_MAP_ID, CREDITS_OFFSETS_ID, CREDITS_SCROLL_Y_ID, CREDITS_TEXT_ID, DUNGEON_MAP_LABELS_ID,
  ENDING_CAPTION_DATA_ID, ENDING_CAPTION_OFFSETS_ID, FLOOR_LABELS_ID, NAME_GRID_ID, PAUSE_HEADERS_ID, TILEMAP_FONT_DATA_ID,
  TILEMAP_FONT_ID, menuTilemapId, pauseTableId, selectFileTableId, sheetPatchTableId, sheetTableId,
};
