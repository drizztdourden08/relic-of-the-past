/* @layer shared-game @kind data */

import type { CheckRecord } from '@shared/game/data/types';

const LW_OVERWORLD_SOUTH_HYRULE_CHECKS: CheckRecord[] = [
  {
    id: 'check-045',
    gameId: { roomId: 283, mask: 1024 },
    kind: 'standing',
    screenId: 'screen-167',
    regionId: 'region-099',
    name: 'Cave 45',
    vanillaItemIds: ['item-024'],
    scope: 'world-item',
  },
];

export { LW_OVERWORLD_SOUTH_HYRULE_CHECKS };
