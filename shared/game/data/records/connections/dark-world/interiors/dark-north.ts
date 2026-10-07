/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const DW_INTERIORS_DARK_NORTH_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-1081',
    screenId: 'screen-484',
    toConnectionId: 'connection-863',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    gameId: { entranceId: 99 },
    tags: [],
  },
  {
    id: 'connection-1097',
    screenId: 'screen-471',
    toConnectionId: 'connection-879',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    gameId: { entranceId: 90 },
    tags: [],
  },
];

export { DW_INTERIORS_DARK_NORTH_CONNECTIONS };
