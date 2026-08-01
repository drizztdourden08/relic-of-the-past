/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const DW_HINTS_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-871',
    kind: 'entrance',
    fromScreenId: 'screen-238',
    toScreenId: 'screen-467',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-872',
    kind: 'entrance',
    fromScreenId: 'screen-263',
    toScreenId: 'screen-480',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-873',
    kind: 'entrance',
    fromScreenId: 'screen-271',
    toScreenId: 'screen-481',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-874',
    kind: 'entrance',
    fromScreenId: 'screen-304',
    toScreenId: 'screen-486',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-875',
    kind: 'entrance',
    fromScreenId: 'screen-313',
    toScreenId: 'screen-485',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-876',
    kind: 'entrance',
    fromScreenId: 'screen-242',
    toScreenId: 'screen-479',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
];

export { DW_HINTS_CONNECTIONS };
