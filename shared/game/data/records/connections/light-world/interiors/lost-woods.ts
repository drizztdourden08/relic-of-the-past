/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const LW_INTERIORS_LOST_WOODS_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-1301',
    screenId: 'screen-176',
    toConnectionId: 'connection-322',
    kind: 'drop',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: false,
    gameId: { holeIndex: 7 },
    tags: [],
  },
  {
    id: 'connection-326',
    screenId: 'screen-176',
    toConnectionId: 'connection-1303',
    kind: 'hole',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-076'],
  },
  {
    id: 'connection-327',
    screenId: 'screen-175',
    toConnectionId: 'connection-323',
    kind: 'entrance',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 15, y: 63, w: 2, h: 1 },
      tiles: [{ x: 15, y: 63 }, { x: 16, y: 63 }],
    },
    canExit: true,
    tags: ['tag-075'],
  },
  {
    id: 'connection-1303',
    screenId: 'screen-175',
    toConnectionId: 'connection-326',
    kind: 'drop',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: false,
    tags: [],
  },
  {
    id: 'connection-1405',
    screenId: 'screen-215',
    toConnectionId: 'connection-350',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { LW_INTERIORS_LOST_WOODS_CONNECTIONS };
