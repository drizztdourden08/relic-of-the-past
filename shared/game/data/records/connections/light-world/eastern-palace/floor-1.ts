/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const LW_EASTERN_PALACE_FLOOR_1_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-259',
    screenId: 'screen-140',
    toConnectionId: 'connection-1342',
    kind: 'hole',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    dungeonId: 'dungeon-003',
    tags: ['tag-076'],
  },
  {
    id: 'connection-260',
    screenId: 'screen-140',
    toConnectionId: 'connection-1343',
    kind: 'edge',
    placement: { form: 'border', side: 'south', rect: { x: 0, y: 63, w: 64, h: 1 }, tiles: [] },
    canExit: true,
    dungeonId: 'dungeon-003',
    tags: ['tag-076'],
  },
  {
    id: 'connection-261',
    screenId: 'screen-141',
    toConnectionId: 'connection-1344',
    kind: 'stairs',
    placement: {
      form: 'area',
      rect: { x: 15, y: 35, w: 2, h: 2 },
      tiles: [{ x: 15, y: 35 }, { x: 15, y: 36 }, { x: 16, y: 35 }, { x: 16, y: 36 }],
    },
    canExit: true,
    gameId: { stairIndex: 0 },
    dungeonId: 'dungeon-003',
    requirements: { itemId: 'item-097' },
    tags: ['tag-076'],
  },
  {
    id: 'connection-262',
    screenId: 'screen-141',
    toConnectionId: 'connection-1345',
    kind: 'door',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 31, y: 63, w: 2, h: 1 },
      tiles: [{ x: 31, y: 63 }, { x: 32, y: 63 }],
    },
    canExit: true,
    dungeonId: 'dungeon-003',
    requirements: { itemId: 'item-097' },
    tags: ['tag-076'],
  },
  {
    id: 'connection-1343',
    screenId: 'screen-141',
    toConnectionId: 'connection-260',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { LW_EASTERN_PALACE_FLOOR_1_CONNECTIONS };
