/* @layer shared-asset-extraction @kind data */
import type { ScreenAddressTable } from '../screen-payload.type';
import { US_EN_SHARED } from './us-en-shared';

const US_SCREEN_ADDRESSES: ScreenAddressTable = {
  id: 'us',
  menuTilemaps: [0xcdd6d, 0xce7bf, 0xce2a8, 0xce63c, 0xce456, 0xeda9c],
  selectFile: {
    gfx0: { address: 0x8ce1c8, count: 224 },
    nameStripes: { address: 0x8ce359, count: 253 },
    copySelect: { address: 0x8ce68d, count: 173 },
    copyBlinker: { address: 0x8cd0ee, count: 73 },
    copyTargetTab0: { address: 0x8ce73a, count: 133 },
    copyTargetTab2: { address: 0x8cd23a, count: 49 },
    killTarget: { address: 0x8ce53f, count: 253 },
    killTargetTab2: { address: 0x8cd41e, count: 101 },
  },
  nameGrid: { address: 0x8cd935, count: 128 },
  ...US_EN_SHARED,
  creditsDigits: { address: 0x8ebe04, count: 2 },
  endingCaptions: {
    kind: 'bytes',
    offsets: { address: 0x8ec2e1, count: 17 },
    data: { address: 0x8ebf4c, count: 917 },
  },
  credits: {
    kind: 'bytes',
    text: { address: 0x8eb178, count: 1989 },
    offsets: { address: 0x8eb93d, count: 394 },
    map: { address: 0x8eb038, count: 160 },
  },
  sheets: { spr: [105, 106, 107], bg: [] },
  sheetPatches: [],
};

export { US_SCREEN_ADDRESSES };
