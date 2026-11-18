/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import {
  END_WORD_SHEET, END_WORD_TILES, FLOOR_LABELS_FR, FLOOR_LETTER_SHEET, FLOOR_LETTER_TILES_FR, LATIN_TILEMAP_REBASE,
  PRESENTS_SHEET, PRESENTS_TILES_FR,
} from '../screens.constants';

const LATIN_SHARED: Pick<ScreenAddressTable, 'sheets' | 'tilemapRebase'> = {
  sheets: { spr: [105, 106, 107], bg: [] },
  tilemapRebase: LATIN_TILEMAP_REBASE,
};

const FR_FAMILY_SHARED: Pick<
  ScreenAddressTable,
  'copyScreen' | 'floorLabels' | 'nameGrid' | 'sheetPatches' | 'sheets' | 'tilemapRebase'
> = {
  ...LATIN_SHARED,
  nameGrid: { address: 0x8e982c, count: 128 },
  sheetPatches: [
    { index: END_WORD_SHEET, tiles: END_WORD_TILES },
    { index: PRESENTS_SHEET, tiles: PRESENTS_TILES_FR },
    { index: FLOOR_LETTER_SHEET, tiles: FLOOR_LETTER_TILES_FR },
  ],
  floorLabels: FLOOR_LABELS_FR,
  copyScreen: {
    sourceFairyX: 0x8e8fe9, targetFairyX: 0x8e917a, sourceBlankColumn: 0x8e9122, targetBlankColumn: 0x8e926a,
    targetDigits: 0x8e9184,
  },
};

const FR_FAMILY_SELECT_FILE = {
  copyBlinker: { address: 0x8e8ff1, count: 73 },
  copyTargetTab2: { address: 0x8e913d, count: 61 },
  killTargetTab2: { address: 0x8e932d, count: 73 },
};

const FR_DE_PAUSE: Pick<ScreenAddressTable, 'pauseHeaders' | 'pauseText'> = {
  pauseText: {
    ability: { address: 0x8df881, count: 80 },
    gloves: { address: 0x8df859, count: 20 },
    bottles: { address: 0x8df371, count: 128 },
    mushroom: { address: 0x8df471, count: 16 },
    flute: { address: 0x8df491, count: 32 },
    mirror: { address: 0x8df4d1, count: 16 },
    bow: { address: 0x8df4f1, count: 48 },
    items: { address: 0x8df0f1, count: 320 },
    dungeonItems: { address: 0x8dec31, count: 16 },
  },
  pauseHeaders: { pendantsRow: 0x8de79c, crystalsRow: 0x8de850 },
};

export { FR_DE_PAUSE, FR_FAMILY_SELECT_FILE, FR_FAMILY_SHARED, LATIN_SHARED };
