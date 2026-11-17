/* @layer shared-asset-extraction @kind data */
import type { JaScreenAddressTable } from './ja.type';
import { JA_SHARED_ADDRESSES } from './ja-shared';

const JA_REV1_SCREEN_ADDRESSES: JaScreenAddressTable = {
  ...JA_SHARED_ADDRESSES,
  id: 'ja-rev1',
  menuTilemaps: [0x0cdce7, 0x0ce435, 0x0cde08, 0x0ce244, 0x0ce01e, 0x18bd5c],
  selectFile: {
    nameStripes: { address: 0x8cdef1, count: 301 },
    killTarget: { address: 0x8ce117, count: 301 },
    copySelect: { address: 0x8ce2f7, count: 193 },
    copyTargetTab0: { address: 0x8ce3b8, count: 125 },
    killTargetTab2: { address: 0x8cd32c, count: 81 },
  },
  nameGridAddress: 0x8cd7ff,
};

export { JA_REV1_SCREEN_ADDRESSES };
