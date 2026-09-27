/* @layer shared-game @kind data */
/** The connections of the screens no area owns. */

import type { ConnectionRecord } from '@shared/game/data/types';

const DW_INTERIORS_SPECIAL_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-893',
    screenId: 'screen-452',
    toConnectionId: 'connection-1285',
    kind: 'stairs',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-076'],
  },
  {
    id: 'connection-894',
    screenId: 'screen-451',
    toConnectionId: 'connection-1286',
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
    id: 'connection-1283',
    screenId: 'screen-452',
    toConnectionId: 'connection-428',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1284',
    screenId: 'screen-452',
    toConnectionId: 'connection-892',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1285',
    screenId: 'screen-451',
    toConnectionId: 'connection-893',
    kind: 'stairs',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: false,
    tags: [],
  },
];

export { DW_INTERIORS_SPECIAL_CONNECTIONS };
