/* @layer shared-asset-extraction @kind data */
import { JA_COPYRIGHT_SHEET, JA_COPYRIGHT_TILES } from '../japanese/japanese-screens.constants';
import { PAUSE_TEXT_COMMON } from './pause-text-common';
import type { JaScreenAddressTable } from './ja.type';

const JA_SHARED_ADDRESSES: Pick<
  JaScreenAddressTable,
  | 'credits' | 'creditsDigits' | 'creditsScrollY' | 'dungeonMapLabels' | 'endingCaptions' | 'pauseText'
  | 'sheetPatches' | 'sheetPointers' | 'sheets' | 'titlePalettes'
> = {
  pauseText: {
    ...PAUSE_TEXT_COMMON,
    ability: { address: 0x8df979, count: 80 },
    gloves: { address: 0x8df951, count: 20 },
    bow: { address: 0x8df5e9, count: 48 },
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
  titlePalettes: [
    { address: 0x9be826, count: 35 },
    { address: 0x9be8ea, count: 21 },
    { address: 0x9be604, count: 7 },
    { address: 0x9bd438, count: 7 },
  ],
};

export { JA_SHARED_ADDRESSES };
