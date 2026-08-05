/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const LW_GAMBLE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-349',
    screenId: 'screen-031',
    toConnectionId: 'connection-1404',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-350',
    screenId: 'screen-028',
    toConnectionId: 'connection-1405',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-1404',
    screenId: 'screen-219',
    toConnectionId: 'connection-349',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1405',
    screenId: 'screen-215',
    toConnectionId: 'connection-350',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { LW_GAMBLE_CONNECTIONS };
