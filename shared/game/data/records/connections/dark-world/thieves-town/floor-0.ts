/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const DW_THIEVES_TOWN_FLOOR_0_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-683',
    screenId: 'screen-420',
    toConnectionId: 'connection-1050',
    kind: 'door',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 47, y: 63, w: 2, h: 1 },
      tiles: [{ x: 47, y: 63 }, { x: 48, y: 63 }],
    },
    canExit: true,
    dungeonId: 'dungeon-009',
    tags: ['tag-076'],
  },
  {
    id: 'connection-691',
    screenId: 'screen-449',
    toConnectionId: 'connection-1058',
    kind: 'stairs',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    dungeonId: 'dungeon-009',
    tags: ['tag-076', 'tag-057'],
  },
  {
    id: 'connection-692',
    screenId: 'screen-449',
    toConnectionId: 'connection-676',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    dungeonId: 'dungeon-009',
    tags: ['tag-075'],
  },
  {
    id: 'connection-1048',
    screenId: 'screen-420',
    toConnectionId: 'connection-681',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1056',
    screenId: 'screen-449',
    toConnectionId: 'connection-689',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1057',
    screenId: 'screen-449',
    toConnectionId: 'connection-690',
    kind: 'door',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { DW_THIEVES_TOWN_FLOOR_0_CONNECTIONS };
