/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const LW_INTERIORS_CENTRAL_HYRULE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-1395',
    screenId: 'screen-196',
    toConnectionId: 'connection-338',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-002',
    screenId: 'screen-204',
    toConnectionId: 'connection-1409',
    kind: 'entrance',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 47, y: 63, w: 2, h: 1 },
      tiles: [{ x: 47, y: 63 }, { x: 48, y: 63 }],
    },
    canExit: true,
    tags: ['tag-075', 'tag-065'],
  },
  {
    id: 'connection-1408',
    screenId: 'screen-204',
    toConnectionId: 'connection-001',
    kind: 'teleport',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: false,
    tags: [],
  },
  {
    id: 'connection-366',
    screenId: 'screen-204',
    toConnectionId: 'connection-365',
    kind: 'entrance',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 47, y: 63, w: 2, h: 1 },
      tiles: [{ x: 47, y: 63 }, { x: 48, y: 63 }],
    },
    canExit: true,
    tags: ['tag-075'],
  },
  {
    id: 'connection-375',
    screenId: 'screen-205',
    toConnectionId: 'connection-1430',
    kind: 'entrance',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 47, y: 63, w: 2, h: 1 },
      tiles: [{ x: 47, y: 63 }, { x: 48, y: 63 }],
    },
    canExit: true,
    tags: ['tag-074'],
  },
];

export { LW_INTERIORS_CENTRAL_HYRULE_CONNECTIONS };
