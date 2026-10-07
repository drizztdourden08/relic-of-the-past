/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const LW_DESERT_PALACE_FLOOR_B1_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-287',
    screenId: 'screen-130',
    toConnectionId: 'connection-1323',
    kind: 'edge',
    placement: { form: 'border', side: 'south', rect: { x: 0, y: 63, w: 64, h: 1 }, tiles: [] },
    canExit: true,
    dungeonId: 'dungeon-004',
    tags: ['tag-076'],
  },
  {
    id: 'connection-288',
    screenId: 'screen-130',
    toConnectionId: 'connection-1324',
    kind: 'edge',
    placement: { form: 'border', side: 'east', rect: { x: 63, y: 0, w: 1, h: 64 }, tiles: [] },
    canExit: true,
    dungeonId: 'dungeon-004',
    tags: ['tag-076'],
  },
  {
    id: 'connection-289',
    screenId: 'screen-131',
    toConnectionId: 'connection-1325',
    kind: 'door',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 47, y: 63, w: 2, h: 1 },
      tiles: [{ x: 47, y: 63 }, { x: 48, y: 63 }],
    },
    canExit: true,
    dungeonId: 'dungeon-004',
    tags: ['tag-076'],
  },
  {
    id: 'connection-1321',
    screenId: 'screen-130',
    toConnectionId: 'connection-285',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1324',
    screenId: 'screen-131',
    toConnectionId: 'connection-288',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { LW_DESERT_PALACE_FLOOR_B1_CONNECTIONS };
