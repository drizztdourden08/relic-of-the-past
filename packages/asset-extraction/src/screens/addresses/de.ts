/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import {
  END_WORD_SHEET, END_WORD_TILES, FLOOR_LETTER_SHEET, FLOOR_LETTER_TILES_DE, PRESENTS_SHEET, PRESENTS_TILES_DE,
} from '../screens.constants';
import { FR_DE_PAUSE, LATIN_SHARED } from './latin-shared';

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
  ...FR_DE_PAUSE,
  hudLifeRow: { address: 0x8dfdcb, count: 6 },
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
  ...LATIN_SHARED,
  sheetPatches: [
    { index: END_WORD_SHEET, tiles: END_WORD_TILES },
    { index: PRESENTS_SHEET, tiles: PRESENTS_TILES_DE },
    { index: FLOOR_LETTER_SHEET, tiles: FLOOR_LETTER_TILES_DE },
  ],
  copyScreen: {
    sourceFairyX: 0x8e8fe9, targetFairyX: 0x8e9172, sourceBlankColumn: 0x8e9122, targetBlankColumn: 0x8e9262,
    targetDigits: 0x8e917c,
  },
};

export { DE_SCREEN_ADDRESSES };
