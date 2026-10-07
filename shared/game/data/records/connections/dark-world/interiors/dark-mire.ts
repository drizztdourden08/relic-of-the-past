/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const DW_INTERIORS_DARK_MIRE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-1085',
    screenId: 'screen-456',
    toConnectionId: 'connection-867',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    gameId: { entranceId: 94 },
    tags: [],
  },
  {
    id: 'connection-1089',
    screenId: 'screen-467',
    toConnectionId: 'connection-871',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1095',
    screenId: 'screen-472',
    toConnectionId: 'connection-877',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { DW_INTERIORS_DARK_MIRE_CONNECTIONS };
