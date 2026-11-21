/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import { FR_DE_PAUSE, FR_FAMILY_SELECT_FILE, FR_FAMILY_SHARED } from './latin-shared';

const FR_SCREEN_ADDRESSES: ScreenAddressTable = {
  id: 'fr',
  menuTilemaps: [0x8e9c68, 0x8ea72e, 0x8ea1bb, 0x8ea583, 0x8ea395, 0x83e90c],
  selectFile: {
    gfx0: { address: 0x8ea0c3, count: 248 },
    nameStripes: { address: 0x8ea298, count: 253 },
    copySelect: { address: 0x8ea5fc, count: 173 },
    ...FR_FAMILY_SELECT_FILE,
    copyTargetTab0: { address: 0x8ea6a9, count: 133 },
    killTarget: { address: 0x8ea486, count: 253 },
  },
  ...FR_DE_PAUSE,
  hudLifeRow: { address: 0x8dfdcb, count: 6 },
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
  ...FR_FAMILY_SHARED,
};

export { FR_SCREEN_ADDRESSES };
