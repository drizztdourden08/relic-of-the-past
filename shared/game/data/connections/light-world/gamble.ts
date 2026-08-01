/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const LW_GAMBLE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-349',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-219',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-350',
    kind: 'entrance',
    fromScreenId: 'screen-028',
    toScreenId: 'screen-215',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
];

export { LW_GAMBLE_CONNECTIONS };
