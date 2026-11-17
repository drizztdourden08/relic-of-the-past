/* @layer shared-asset-extraction @kind constants */
import type { PauseTable, SelectFileTable } from './screen-payload.type';

const SELECT_FILE_TABLES: readonly SelectFileTable[] = [
  'gfx0', 'nameStripes', 'copySelect', 'copyBlinker', 'copyTargetTab0', 'copyTargetTab2', 'killTarget', 'killTargetTab2',
];

const PAUSE_TABLES: readonly PauseTable[] = [
  'ability', 'gloves', 'bottles', 'mushroom', 'flute', 'mirror', 'bow', 'items', 'dungeonItems',
];

const SHEET_TABLE_STRIDE = 0xdf;

const SPRITE_RAW_SHEET_COUNT = 12;

const SPRITE_RAW_SHEET_BYTES = 0x600;

const TILEMAP_FONT_BYTES = 256 * 16;

const OWN_FONT_INDEX = 0;

export {
  OWN_FONT_INDEX, PAUSE_TABLES, SELECT_FILE_TABLES, SHEET_TABLE_STRIDE, SPRITE_RAW_SHEET_BYTES, SPRITE_RAW_SHEET_COUNT,
  TILEMAP_FONT_BYTES,
};
