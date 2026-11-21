/* @layer shared-asset-extraction @kind constants */
import type { FloorLabelTiles, PauseTable, SelectFileTable, TilemapRebase } from './screen-payload.type';

const SELECT_FILE_TABLES: readonly SelectFileTable[] = [
  'gfx0', 'nameStripes', 'copySelect', 'copyBlinker', 'copyTargetTab0', 'copyTargetTab2', 'killTarget', 'killTargetTab2',
];

const PAUSE_TABLES: readonly PauseTable[] = [
  'ability', 'gloves', 'bottles', 'mushroom', 'flute', 'mirror', 'bow', 'items', 'dungeonItems',
];

const SHEET_TILE_BYTES = 24;

const END_WORD_SHEET = 45;

const END_WORD_TILES: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 18, 19, 20, 21, 22, 23];

const PRESENTS_SHEET = 8;

const PRESENTS_TILES_FR: readonly number[] = [19, 43, 45, 57, 58, 59, 60, 61, 62, 63];

const PRESENTS_TILES_EN: readonly number[] = [58, 59, 60, 61, 62];

const PRESENTS_TILES_DE: readonly number[] = [43, 45, 57, 58, 59, 60, 61, 62, 63];

const FLOOR_LETTER_SHEET = 97;

const FLOOR_LETTER_TILES_EN: readonly number[] = [29];

const FLOOR_LETTER_TILES_FR: readonly number[] = [23, 24, 28, 29];

const FLOOR_LETTER_TILES_DE: readonly number[] = [28, 29];

const FLOOR_LABELS_FR: FloorLabelTiles = { basementPrefix: 0x17, upperSuffix: 0x18, ground: [0x1c, 0x1d] };

const LATIN_TILEMAP_REBASE: TilemapRebase = { from: 0x7800, to: 0x6000 };

const COPY_SOURCE_ROWS = 4;

const COPY_TARGET_ROWS = 3;

const COPY_TARGET_DIGIT_BYTES = 6;

const PAUSE_BOX_HEADER_WORDS = 4;

const PROGRESS_HEADER_ROW_WORDS = 10;

const SHEET_TABLE_STRIDE = 0xdf;

const SPRITE_RAW_SHEET_COUNT = 12;

const SPRITE_RAW_SHEET_BYTES = 0x600;

const TILEMAP_FONT_BYTES = 256 * 16;

const OWN_FONT_INDEX = 0;

export {
  COPY_SOURCE_ROWS, COPY_TARGET_DIGIT_BYTES, COPY_TARGET_ROWS, END_WORD_SHEET, END_WORD_TILES, FLOOR_LABELS_FR,
  FLOOR_LETTER_SHEET, FLOOR_LETTER_TILES_DE, FLOOR_LETTER_TILES_EN, FLOOR_LETTER_TILES_FR, LATIN_TILEMAP_REBASE,
  OWN_FONT_INDEX, PAUSE_BOX_HEADER_WORDS, PAUSE_TABLES, PRESENTS_SHEET, PRESENTS_TILES_DE, PRESENTS_TILES_EN,
  PRESENTS_TILES_FR, PROGRESS_HEADER_ROW_WORDS, SELECT_FILE_TABLES, SHEET_TABLE_STRIDE, SHEET_TILE_BYTES,
  SPRITE_RAW_SHEET_BYTES, SPRITE_RAW_SHEET_COUNT, TILEMAP_FONT_BYTES,
};
