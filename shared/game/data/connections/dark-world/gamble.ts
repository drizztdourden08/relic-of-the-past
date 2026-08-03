/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const DW_GAMBLE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-869',
    kind: 'entrance',
    fromScreenId: 'screen-247',
    toScreenId: 'screen-470',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-870',
    kind: 'entrance',
    fromScreenId: 'screen-274',
    toScreenId: 'screen-469',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
];

export { DW_GAMBLE_CONNECTIONS };
