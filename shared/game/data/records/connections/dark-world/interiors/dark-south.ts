/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const DW_INTERIORS_DARK_SOUTH_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-1082',
    screenId: 'screen-460',
    toConnectionId: 'connection-864',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    gameId: { entranceId: 113 },
    tags: [],
  },
  {
    id: 'connection-1281',
    screenId: 'screen-466',
    toConnectionId: 'connection-890',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { DW_INTERIORS_DARK_SOUTH_CONNECTIONS };
