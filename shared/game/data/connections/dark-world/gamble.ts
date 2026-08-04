/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const DW_GAMBLE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-869',
    screenId: 'screen-247',
    toConnectionId: 'connection-1087',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-870',
    screenId: 'screen-274',
    toConnectionId: 'connection-1088',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-1087',
    screenId: 'screen-470',
    toConnectionId: 'connection-869',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1088',
    screenId: 'screen-469',
    toConnectionId: 'connection-870',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { DW_GAMBLE_CONNECTIONS };
