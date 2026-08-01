/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../../types';

const LW_OVERWORLD_SOUTH_HYRULE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-046',
    kind: 'edge',
    fromScreenId: 'screen-003',
    toScreenId: 'screen-057',
    direction: 'one-way',
    counterpartId: 'connection-191',
    tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'],
  },
  {
    id: 'connection-145',
    kind: 'edge',
    fromScreenId: 'screen-057',
    toScreenId: 'screen-065',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-146',
    kind: 'edge',
    fromScreenId: 'screen-057',
    toScreenId: 'screen-058',
    placement: { at: 'side', side: 'south' },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
  {
    id: 'connection-191',
    kind: 'edge',
    fromScreenId: 'screen-057',
    toScreenId: 'screen-003',
    direction: 'two-way',
    counterpartId: 'connection-046',
    tags: ['dir:two-way', 'ctx:overworld'],
  },
];

export { LW_OVERWORLD_SOUTH_HYRULE_CONNECTIONS };
