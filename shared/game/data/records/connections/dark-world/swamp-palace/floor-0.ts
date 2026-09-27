/* @layer shared-game @kind data */

import type { ConnectionRecord } from '@shared/game/data/types';

const DW_SWAMP_PALACE_FLOOR_0_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-641',
    screenId: 'screen-341',
    toConnectionId: 'connection-648',
    kind: 'stairs',
    placement: {
      form: 'area',
      rect: { x: 15, y: 3, w: 2, h: 2 },
      tiles: [{ x: 15, y: 3 }, { x: 15, y: 4 }, { x: 16, y: 3 }, { x: 16, y: 4 }],
    },
    canExit: true,
    gameId: { stairIndex: 0 },
    dungeonId: 'dungeon-007',
    tags: ['tag-076'],
  },
  {
    id: 'connection-654',
    screenId: 'screen-341',
    toConnectionId: 'connection-1030',
    kind: 'entrance',
    placement: {
      form: 'border',
      side: 'south',
      rect: { x: 31, y: 63, w: 2, h: 1 },
      tiles: [{ x: 31, y: 63 }, { x: 32, y: 63 }],
    },
    canExit: true,
    dungeonId: 'dungeon-007',
    tags: ['tag-075'],
  },
  {
    id: 'connection-1029',
    screenId: 'screen-341',
    toConnectionId: 'connection-635',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { DW_SWAMP_PALACE_FLOOR_0_CONNECTIONS };
