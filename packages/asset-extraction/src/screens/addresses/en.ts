/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import { FLOOR_LETTER_SHEET, FLOOR_LETTER_TILES_EN, PRESENTS_SHEET, PRESENTS_TILES_EN } from '../screens.constants';

const EN_SCREEN_ADDRESSES: ScreenAddressTable = {
  id: 'en',
  menuTilemaps: [0xcdd8c, 0xce7de, 0xce2c7, 0xce65b, 0xce475, 0xedabc],
  selectFile: {
    gfx0: { address: 0x8ce1e7, count: 224 },
    nameStripes: { address: 0x8ce378, count: 253 },
    copySelect: { address: 0x8ce6ac, count: 173 },
    copyBlinker: { address: 0x8cd10d, count: 73 },
    copyTargetTab0: { address: 0x8ce759, count: 133 },
    copyTargetTab2: { address: 0x8cd259, count: 49 },
    killTarget: { address: 0x8ce55e, count: 253 },
    killTargetTab2: { address: 0x8cd43d, count: 101 },
  },
  nameGrid: { address: 0x8cd954, count: 128 },
  pauseText: {
    ability: { address: 0x8df959, count: 80 },
    gloves: { address: 0x8df931, count: 20 },
    bottles: { address: 0x8df449, count: 128 },
    mushroom: { address: 0x8df549, count: 16 },
    flute: { address: 0x8df569, count: 32 },
    mirror: { address: 0x8df5a9, count: 16 },
    bow: { address: 0x8df5c9, count: 48 },
    items: { address: 0x8df1c9, count: 320 },
    dungeonItems: { address: 0x8ded09, count: 16 },
  },
  dungeonMapLabels: { address: 0x8af009, count: 744 },
  creditsDigits: { address: 0x8ebe23, count: 2 },
  endingCaptions: {
    kind: 'bytes',
    offsets: { address: 0x8ec300, count: 17 },
    data: { address: 0x8ebf6b, count: 917 },
  },
  credits: {
    kind: 'bytes',
    text: { address: 0x8eb17e, count: 1989 },
    offsets: { address: 0x8eb943, count: 394 },
    map: { address: 0x8eb03e, count: 160 },
  },
  sheetPointers: { spr: 0x00cff3, bg: 0x00cf80 },
  sheets: { spr: [105], bg: [] },
  sheetPatches: [{ index: PRESENTS_SHEET, tiles: PRESENTS_TILES_EN }, { index: FLOOR_LETTER_SHEET, tiles: FLOOR_LETTER_TILES_EN }],
};

export { EN_SCREEN_ADDRESSES };
