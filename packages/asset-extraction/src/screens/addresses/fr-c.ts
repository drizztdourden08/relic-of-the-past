/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import { FR_FAMILY_SELECT_FILE, FR_FAMILY_SHARED } from './latin-shared';

const FR_C_SCREEN_ADDRESSES: ScreenAddressTable = {
  id: 'fr-c',
  menuTilemaps: [0x8e9c63, 0x8ea729, 0x8ea1b6, 0x8ea57e, 0x8ea390, 0x8cfaec],
  selectFile: {
    gfx0: { address: 0x8ea0be, count: 248 },
    nameStripes: { address: 0x8ea293, count: 253 },
    copySelect: { address: 0x8ea5f7, count: 173 },
    ...FR_FAMILY_SELECT_FILE,
    copyTargetTab0: { address: 0x8ea6a4, count: 133 },
    killTarget: { address: 0x8ea481, count: 253 },
  },
  pauseText: {
    ability: { address: 0x8df941, count: 80 },
    gloves: { address: 0x8df919, count: 20 },
    bottles: { address: 0x8df431, count: 128 },
    mushroom: { address: 0x8df531, count: 16 },
    flute: { address: 0x8df551, count: 32 },
    mirror: { address: 0x8df591, count: 16 },
    bow: { address: 0x8df5b1, count: 48 },
    items: { address: 0x8df1b1, count: 320 },
    dungeonItems: { address: 0x8decf1, count: 16 },
  },
  dungeonMapLabels: { address: 0x8af0a2, count: 744 },
  creditsDigits: { address: 0x8eeaf2, count: 2 },
  endingCaptions: {
    kind: 'words',
    offsets: { address: 0x8ef36c, count: 17 },
    data: { address: 0x8eec40, count: 1836 },
    vramRebase: 0x1800,
  },
  credits: {
    kind: 'words',
    text: { address: 0x8ed799, count: 3725 },
    offsets: { address: 0x8ee624, count: 394 },
  },
  sheetPointers: { spr: 0xcf99, bg: 0xcf26 },
  pauseHeaders: { pendantsRow: 0x8de85c, crystalsRow: 0x8de910 },
  hudLifeRow: { address: 0x8dfe8b, count: 6 },
  ...FR_FAMILY_SHARED,
};

export { FR_C_SCREEN_ADDRESSES };
