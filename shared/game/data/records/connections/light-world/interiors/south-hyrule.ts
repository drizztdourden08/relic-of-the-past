/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const LW_INTERIORS_SOUTH_HYRULE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-1300',
    screenId: 'screen-167',
    toConnectionId: 'connection-321',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    gameId: { entranceId: 81 },
    tags: [],
  },
];

export { LW_INTERIORS_SOUTH_HYRULE_CONNECTIONS };
