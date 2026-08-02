/* @layer shared-game @kind data */
/** Further split by locality out of checks/{dungeons,light-world,dark-world}.ts — Package T. */
import type { CheckRecord } from '../../types';
import { ITEM_GROUP_IDS } from '../../item-groups';

const LW_LOST_WOODS_CHECKS: CheckRecord[] = [
  {
    id: 'check-043',
    gameId: { roomId: 225, chestIndex: 5, mask: 512 },
    kind: 'standing',
    screenId: 'screen-175',
    randomizerName: 'Lost Woods Hideout',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-044',
    gameId: { roomId: 226, mask: 512 },
    kind: 'standing',
    screenId: 'screen-225',
    randomizerName: 'Lumberjack Tree',
    vanillaItemIds: ['item-024'],
  },
  {
    id: 'check-072',
    gameId: { owScreen: 128, mask: 64 },
    kind: 'standing',
    screenId: 'screen-036',
    randomizerName: 'Master Sword Pedestal',
    vanillaItemIds: ['item-079'],
    requirements: { count: { groupId: ITEM_GROUP_IDS.Pendants, n: 3 } },
  },
];

export { LW_LOST_WOODS_CHECKS };
