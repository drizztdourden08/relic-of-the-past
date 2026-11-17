/* @layer shared-asset-extraction @kind data */
import type { JaScreenAddressTable } from './ja.type';
import { JA_SHARED_ADDRESSES } from './ja-shared';

const JA_V1_0_SCREEN_ADDRESSES: JaScreenAddressTable = {
  ...JA_SHARED_ADDRESSES,
  id: 'ja-v1.0',
  menuTilemaps: [0x0cdcc7, 0x0ce415, 0x0cdde8, 0x0ce224, 0x0cdffe, 0x18bd5c],
  selectFile: {
    nameStripes: { address: 0x8cded1, count: 301 },
    killTarget: { address: 0x8ce0f7, count: 301 },
    copySelect: { address: 0x8ce2d7, count: 193 },
    copyBlinker: { address: 0x8ccfdf, count: 71 },
    copyTargetTab0: { address: 0x8ce398, count: 125 },
    copyTargetTab2: { address: 0x8cd12a, count: 57 },
    killTargetTab2: { address: 0x8cd30c, count: 81 },
  },
  nameGridAddress: 0x8cd7df,
  copyrightOam: { table: { address: 0x0cc76f, count: 10 }, startX: 0x0cc758, startY: 0x0cc760 },
  titleYLimit: 0x0cc5a1,
};

export { JA_V1_0_SCREEN_ADDRESSES };
