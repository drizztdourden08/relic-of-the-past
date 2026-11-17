/* @layer shared-asset-extraction @kind data */
import { JA_COPYRIGHT_SHEET, JA_COPYRIGHT_TILES } from '../japanese/japanese-screens.constants';
import type { JaScreenAddressTable } from './ja.type';

const JA_SHARED_ADDRESSES: Pick<
  JaScreenAddressTable,
  | 'credits' | 'creditsDigits' | 'creditsScrollY' | 'dungeonMapLabels' | 'endingCaptions' | 'pauseText'
  | 'sheetPatches' | 'sheetPointers' | 'sheets'
> = {
  pauseText: {
    ability: { address: 0x8df979, count: 80 },
    gloves: { address: 0x8df951, count: 20 },
    bottles: { address: 0x8df449, count: 128 },
    mushroom: { address: 0x8df549, count: 16 },
    flute: { address: 0x8df569, count: 32 },
    mirror: { address: 0x8df5a9, count: 16 },
    bow: { address: 0x8df5e9, count: 48 },
    items: { address: 0x8df1c9, count: 320 },
    dungeonItems: { address: 0x8ded09, count: 16 },
  },
  dungeonMapLabels: { address: 0x8af019, count: 744 },
  creditsDigits: { address: 0x8ee7dc, count: 2 },
  creditsScrollY: { address: 0x8ee629, count: 14 },
  endingCaptions: {
    kind: 'bytes',
    offsets: { address: 0x8eecc0, count: 17 },
    data: { address: 0x8ee924, count: 924 },
  },
  credits: {
    kind: 'bytes',
    text: { address: 0x8edba8, count: 1905 },
    offsets: { address: 0x8ee319, count: 392 },
    map: { address: 0x8eda68, count: 160 },
  },
  sheetPointers: { spr: 0xd033, bg: 0xcfc0 },
  sheets: { spr: [105, 106], bg: [22, 23, 29, 30, 57, 64, 65] },
  sheetPatches: [{ index: JA_COPYRIGHT_SHEET, tiles: JA_COPYRIGHT_TILES }],
};

export { JA_SHARED_ADDRESSES };
