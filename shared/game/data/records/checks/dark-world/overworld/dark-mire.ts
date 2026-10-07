/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';

const DW_OVERWORLD_DARK_MIRE_CHECKS: CheckRecord[] = [
  {
    id: 'check-089',
    gameId: { roomId: 269, chestIndex: 0 },
    kind: 'chest',
    screenId: 'screen-472',
    regionId: 'region-154',
    name: 'Mire Shed - Left',
    vanillaItemIds: ['item-024'],
    review: { status: 'verified', source: 'person', at: '2026-08-26T03:06:52.923Z' },
  },
  {
    id: 'check-090',
    gameId: { roomId: 269, chestIndex: 1 },
    kind: 'chest',
    screenId: 'screen-472',
    regionId: 'region-154',
    name: 'Mire Shed - Right',
    vanillaItemIds: ['item-055'],
    review: {
      status: 'accepted',
      source: 'person',
      note: 'vanillaItemIds[0] item-072 -> item-055: S1 census item byte at the certified position == receive-item id (decomp id-space ruling)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
];

export { DW_OVERWORLD_DARK_MIRE_CHECKS };
