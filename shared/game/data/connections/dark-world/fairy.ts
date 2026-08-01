/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';
import { canUseBombs } from '../../requirements/helpers';

const DW_FAIRY_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-863',
    kind: 'entrance',
    fromScreenId: 'screen-280',
    toScreenId: 'screen-484',
    direction: 'two-way',
    tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'],
  },
  {
    id: 'connection-864',
    kind: 'entrance',
    fromScreenId: 'screen-282',
    toScreenId: 'screen-460',
    direction: 'two-way',
    tags: ['transit:bonk', 'dir:two-way', 'ctx:entrance', 'barrier:dash'],
  },
  {
    id: 'connection-865',
    kind: 'entrance',
    fromScreenId: 'screen-299',
    toScreenId: 'screen-461',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-866',
    kind: 'entrance',
    fromScreenId: 'screen-242',
    toScreenId: 'screen-462',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
    requirements: { allOf: [{ itemId: 'item-032' }, canUseBombs] },
  },
  {
    id: 'connection-867',
    kind: 'entrance',
    fromScreenId: 'screen-238',
    toScreenId: 'screen-456',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-868',
    kind: 'entrance',
    fromScreenId: 'screen-237',
    toScreenId: 'screen-454',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
];

export { DW_FAIRY_CONNECTIONS };
