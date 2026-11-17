/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import { END_WORD_SHEET, END_WORD_TILES } from '../screens.constants';

const FR_SCREEN_ADDRESSES: ScreenAddressTable = {
  id: 'fr',
  menuTilemaps: [0x8e9c68, 0x8ea72e, 0x8ea1bb, 0x8ea583, 0x8ea395, 0x83e90c],
  selectFile: {
    gfx0: { address: 0x8ea0c3, count: 248 },
    nameStripes: { address: 0x8ea298, count: 253 },
    copySelect: { address: 0x8ea5fc, count: 173 },
    copyBlinker: { address: 0x8e8ff1, count: 73 },
    copyTargetTab0: { address: 0x8ea6a9, count: 133 },
    copyTargetTab2: { address: 0x8e913d, count: 61 },
    killTarget: { address: 0x8ea486, count: 253 },
    killTargetTab2: { address: 0x8e932d, count: 73 },
  },
  nameGrid: { address: 0x8e982c, count: 128 },
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
  dungeonMapLabels: { address: 0x8af026, count: 744 },
  creditsDigits: { address: 0x8aab90, count: 2 },
  endingCaptions: {
    kind: 'words',
    offsets: { address: 0x8ab40a, count: 17 },
    data: { address: 0x8aacde, count: 1836 },
    vramRebase: 0x1800,
  },
  credits: {
    kind: 'words',
    text: { address: 0x8a981e, count: 3725 },
    offsets: { address: 0x8aa6a9, count: 394 },
  },
  sheetPointers: { spr: 0xcf73, bg: 0xcf00 },
  sheets: { spr: [105, 106, 107], bg: [] },
  sheetPatches: [{ index: END_WORD_SHEET, tiles: END_WORD_TILES }],
};

export { FR_SCREEN_ADDRESSES };
