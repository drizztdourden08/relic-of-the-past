/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const DW_SPECIAL_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-428',
    kind: 'entrance',
    fromScreenId: 'screen-252',
    toScreenId: 'screen-452',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-892',
    kind: 'entrance',
    fromScreenId: 'screen-256',
    toScreenId: 'screen-452',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-893',
    kind: 'stairs',
    fromScreenId: 'screen-452',
    toScreenId: 'screen-451',
    direction: 'one-way',
    tags: ['dir:one-way', 'ctx:internal'],
  },
  {
    id: 'connection-894',
    kind: 'entrance',
    fromScreenId: 'screen-451',
    toScreenId: 'screen-280',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 15, end: 16 } },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:exit'],
  },
];

export { DW_SPECIAL_CONNECTIONS };
