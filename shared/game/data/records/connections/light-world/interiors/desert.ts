/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const LW_INTERIORS_DESERT_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-1287',
    screenId: 'screen-160',
    toConnectionId: 'connection-306',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    gameId: { entranceId: 77 },
    tags: [],
  },
  {
    id: 'connection-1288',
    screenId: 'screen-168',
    toConnectionId: 'connection-307',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    gameId: { entranceId: 114 },
    tags: [],
  },
  {
    id: 'connection-1401',
    screenId: 'screen-187',
    toConnectionId: 'connection-346',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1299',
    screenId: 'screen-158',
    toConnectionId: 'connection-320',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    gameId: { entranceId: 109 },
    tags: [],
  },
];

export { LW_INTERIORS_DESERT_CONNECTIONS };
