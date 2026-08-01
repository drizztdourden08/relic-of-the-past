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
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-870',
    kind: 'entrance',
    fromScreenId: 'screen-274',
    toScreenId: 'screen-469',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
];

export { DW_GAMBLE_CONNECTIONS };
