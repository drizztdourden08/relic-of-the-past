/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../../types';
import { canLiftHeavyRocks } from '../../../requirements/helpers';

const LW_OVERWORLD_DESERT_2_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-144',
    kind: 'edge',
    fromScreenId: 'screen-049',
    toScreenId: 'screen-050',
    placement: { at: 'side', side: 'south' },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-156',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-050',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-157',
    kind: 'edge',
    fromScreenId: 'screen-050',
    toScreenId: 'screen-058',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-158',
    kind: 'edge',
    fromScreenId: 'screen-058',
    toScreenId: 'screen-066',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-184',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-009',
    direction: 'two-way',
    counterpartId: 'connection-028',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-185',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-010',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-186',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-011',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-187',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-012',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-188',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-013',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-189',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-014',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-190',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-002',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
];

export { LW_OVERWORLD_DESERT_2_CONNECTIONS };
