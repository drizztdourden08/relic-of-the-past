/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '@shared/game/data/types';
import { canUseBombs } from '@shared/game/data/requirements/helpers';

const LW_SHOPS_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-400',
    screenId: 'screen-031',
    toConnectionId: 'connection-1616',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-401',
    screenId: 'screen-081',
    toConnectionId: 'connection-1617',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-402',
    screenId: 'screen-004',
    toConnectionId: 'connection-1618',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    requirements: canUseBombs,
    tags: ['tag-074'],
  },
  {
    id: 'connection-403',
    screenId: 'screen-085',
    toConnectionId: 'connection-1619',
    kind: 'entrance',
    placement: {
      form: 'area',
      rect: { x: 24, y: 40, w: 2, h: 2 },
      tiles: [{ x: 24, y: 40 }, { x: 24, y: 41 }, { x: 25, y: 40 }, { x: 25, y: 41 }],
    },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-1616',
    screenId: 'screen-199',
    toConnectionId: 'connection-400',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1617',
    screenId: 'screen-214',
    toConnectionId: 'connection-401',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1618',
    screenId: 'screen-213',
    toConnectionId: 'connection-402',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1619',
    screenId: 'screen-220',
    toConnectionId: 'connection-403',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { LW_SHOPS_CONNECTIONS };
