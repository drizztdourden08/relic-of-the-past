/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const LW_HINTS_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-351',
    kind: 'entrance',
    fromScreenId: 'screen-045',
    toScreenId: 'screen-183',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-352',
    kind: 'entrance',
    fromScreenId: 'screen-081',
    toScreenId: 'screen-184',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
];

export { LW_HINTS_CONNECTIONS };
