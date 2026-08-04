/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const LW_HINTS_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-351',
    screenId: 'screen-045',
    toConnectionId: 'connection-1406',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-352',
    screenId: 'screen-081',
    toConnectionId: 'connection-1407',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-074'],
  },
  {
    id: 'connection-1406',
    screenId: 'screen-183',
    toConnectionId: 'connection-351',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1407',
    screenId: 'screen-184',
    toConnectionId: 'connection-352',
    kind: 'entrance',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { LW_HINTS_CONNECTIONS };
