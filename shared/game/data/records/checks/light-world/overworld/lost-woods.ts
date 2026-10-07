/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';
import { ITEM_GROUP_IDS } from '@shared/game/data/item-groups/ids';

const LW_OVERWORLD_LOST_WOODS_CHECKS: CheckRecord[] = [
  {
    id: 'check-043',
    gameId: { roomId: 225, chestIndex: 5, mask: 512 },
    kind: 'standing',
    screenId: 'screen-175',
    regionId: 'region-095',
    name: 'Lost Woods Hideout',
    vanillaItemIds: ['item-024'],
    scope: 'world-item',
  },
  {
    id: 'check-072',
    gameId: { owScreen: 128, mask: 64 },
    kind: 'standing',
    screenId: 'screen-036',
    regionId: 'region-018',
    name: 'Master Sword Pedestal',
    vanillaItemIds: ['item-002'],
    scope: 'world-item',
    requirements: { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } },
    review: {
      status: 'accepted',
      source: 'person',
      note: 'vanillaItemIds[0] item-079 -> item-002: native tables are 76 entries; chest path bails on sign8, and the progressive record no longer carries a receive id, and the pedestal physically grants the tier-2 sword (receive 0x01)',
      at: '2026-08-26T03:06:52.923Z',
    },
  },
];

export { LW_OVERWORLD_LOST_WOODS_CHECKS };
