/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '@shared/game/data/types';

const LW_WELLS_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-404',
    screenId: 'screen-031',
    toConnectionId: 'connection-1620',
    kind: 'hole',
    placement: {
      form: 'area',
      rect: { x: 22, y: 24, w: 2, h: 2 },
      tiles: [{ x: 22, y: 24 }, { x: 22, y: 25 }, { x: 23, y: 24 }, { x: 23, y: 25 }],
    },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-405',
    screenId: 'screen-031',
    toConnectionId: 'connection-407',
    kind: 'entrance',
    placement: {
      form: 'area',
      rect: { x: 22, y: 24, w: 2, h: 2 },
      tiles: [{ x: 22, y: 24 }, { x: 22, y: 25 }, { x: 23, y: 24 }, { x: 23, y: 25 }],
    },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-406',
    screenId: 'screen-221',
    toConnectionId: 'connection-1621',
    kind: 'hole',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-076'],
  },
  {
    id: 'connection-407',
    screenId: 'screen-224',
    toConnectionId: 'connection-405',
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
    id: 'connection-1620',
    screenId: 'screen-221',
    toConnectionId: 'connection-404',
    kind: 'drop',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: false,
    tags: [],
  },
  {
    id: 'connection-1621',
    screenId: 'screen-224',
    toConnectionId: 'connection-406',
    kind: 'drop',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: false,
    tags: [],
  },
];

export { LW_WELLS_CONNECTIONS };
