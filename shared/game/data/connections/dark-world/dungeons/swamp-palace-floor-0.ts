/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../../types';

const DW_DUNGEON_SWAMP_PALACE_FLOOR_0_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-635',
    screenId: 'screen-284',
    toConnectionId: 'connection-1029',
    kind: 'entrance',
    placement: {
      form: 'area',
      rect: { x: 46, y: 28, w: 2, h: 2 },
      tiles: [{ x: 46, y: 28 }, { x: 46, y: 29 }, { x: 47, y: 28 }, { x: 47, y: 29 }],
    },
    canExit: true,
    dungeonId: 'dungeon-007',
    tags: ['tag-081'],
  },
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
  {
    id: 'connection-1030',
    screenId: 'screen-283',
    toConnectionId: 'connection-654',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { DW_DUNGEON_SWAMP_PALACE_FLOOR_0_CONNECTIONS };
