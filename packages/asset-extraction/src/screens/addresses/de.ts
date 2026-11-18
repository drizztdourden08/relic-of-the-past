/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import {
  END_WORD_SHEET, END_WORD_TILES, FLOOR_LETTER_SHEET, FLOOR_LETTER_TILES_DE, LATIN_TILEMAP_REBASE, PRESENTS_SHEET,
  PRESENTS_TILES_DE,
} from '../screens.constants';

const DE_SCREEN_ADDRESSES: ScreenAddressTable = {
  id: 'de',
  menuTilemaps: [0x8e9c9a, 0x8ea760, 0x8ea1e1, 0x8ea5c1, 0x8ea3b3, 0x83e90c],
  selectFile: {
    gfx0: { address: 0x8ea0f5, count: 236 },
    nameStripes: { address: 0x8ea2b6, count: 253 },
    copySelect: { address: 0x8ea62e, count: 173 },
    copyBlinker: { address: 0x8e8ff1, count: 73 },
    copyTargetTab0: { address: 0x8ea6db, count: 133 },
    copyTargetTab2: { address: 0x8e913d, count: 53 },
    killTarget: { address: 0x8ea4c4, count: 253 },
    killTargetTab2: { address: 0x8e9325, count: 93 },
  },
  nameGrid: { address: 0x8e9838, count: 128 },
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
  dungeonMapLabels: { address: 0x8af024, count: 744 },
  creditsDigits: { address: 0x8eebbb, count: 2 },
  endingCaptions: {
    kind: 'words',
    offsets: { address: 0x8ef3c9, count: 17 },
    data: { address: 0x8eed09, count: 1728 },
    vramRebase: 0x1800,
  },
  credits: {
    kind: 'words',
    text: { address: 0x8ed8ae, count: 3629 },
    offsets: { address: 0x8ee6db, count: 394 },
  },
  sheetPointers: { spr: 0xcf73, bg: 0xcf00 },
  sheets: { spr: [105, 106, 107], bg: [] },
  sheetPatches: [
    { index: END_WORD_SHEET, tiles: END_WORD_TILES },
    { index: PRESENTS_SHEET, tiles: PRESENTS_TILES_DE },
    { index: FLOOR_LETTER_SHEET, tiles: FLOOR_LETTER_TILES_DE },
  ],
  tilemapRebase: LATIN_TILEMAP_REBASE,
  pauseHeaders: { pendantsRow: 0x8de79c, crystalsRow: 0x8de850 },
  copyScreen: {
    sourceFairyX: 0x8e8fe9, targetFairyX: 0x8e9172, sourceBlankColumn: 0x8e9122, targetBlankColumn: 0x8e9262,
    targetDigits: 0x8e917c,
  },
};

export { DE_SCREEN_ADDRESSES };
