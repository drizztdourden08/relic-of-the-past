/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const DW_MISERY_MIRE_FLOOR_0_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-738',
    screenId: 'screen-406',
    toConnectionId: 'connection-967',
    kind: 'stairs',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    dungeonId: 'dungeon-011',
    tags: ['tag-076'],
  },
  {
    id: 'connection-759',
    screenId: 'screen-406',
    toConnectionId: 'connection-730',
    kind: 'entrance',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 15, y: 63, w: 2, h: 1 },
      tiles: [{ x: 15, y: 63 }, { x: 16, y: 63 }],
    },
    canExit: true,
    gameId: { entranceId: 39, exitId: 40 },
    dungeonId: 'dungeon-011',
    tags: ['tag-075'],
  },
  {
    id: 'connection-966',
    screenId: 'screen-406',
    toConnectionId: 'connection-737',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { DW_MISERY_MIRE_FLOOR_0_CONNECTIONS };
