/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';
import { canLiftRocks, canUseBombs } from '../../requirements/helpers';

const DW_CAVES_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-852',
    kind: 'entrance',
    fromScreenId: 'screen-253',
    toScreenId: 'screen-468',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance', 'barrier:hammer'],
  },
  {
    id: 'connection-853',
    kind: 'entrance',
    fromScreenId: 'screen-229',
    toScreenId: 'screen-474',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-854',
    kind: 'entrance',
    fromScreenId: 'screen-230',
    toScreenId: 'screen-474',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-855',
    kind: 'entrance',
    fromScreenId: 'screen-291',
    toScreenId: 'screen-455',
    direction: 'two-way',
    tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'],
    requirements: canUseBombs,
  },
  {
    id: 'connection-856',
    kind: 'entrance',
    fromScreenId: 'screen-242',
    toScreenId: 'screen-477',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
    requirements: canLiftRocks,
  },
  {
    id: 'connection-857',
    kind: 'entrance',
    fromScreenId: 'screen-237',
    toScreenId: 'screen-465',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-858',
    kind: 'entrance',
    fromScreenId: 'screen-236',
    toScreenId: 'screen-464',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
    requirements: canLiftRocks,
  },
  {
    id: 'connection-859',
    kind: 'edge',
    fromScreenId: 'screen-464',
    toScreenId: 'screen-458',
    placement: { at: 'side', side: 'north' },
    direction: 'one-way',
    counterpartId: 'connection-860',
    tags: ['transit:bonk', 'dir:one-way', 'ctx:internal', 'barrier:dash'],
  },
  {
    id: 'connection-860',
    kind: 'hole',
    fromScreenId: 'screen-458',
    toScreenId: 'screen-464',
    direction: 'one-way',
    counterpartId: 'connection-859',
    tags: ['transit:hookshot', 'dir:one-way', 'ctx:internal', 'barrier:hookshot'],
  },
  {
    id: 'connection-861',
    kind: 'entrance',
    fromScreenId: 'screen-458',
    toScreenId: 'screen-243',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 47, end: 48 } },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:exit'],
  },
  {
    id: 'connection-862',
    kind: 'entrance',
    fromScreenId: 'screen-254',
    toScreenId: 'screen-459',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
];

export { DW_CAVES_CONNECTIONS };
