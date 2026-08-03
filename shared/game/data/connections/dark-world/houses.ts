/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';
import { canUseBombs } from '../../requirements/helpers';

const DW_HOUSES_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-877',
    kind: 'entrance',
    fromScreenId: 'screen-238',
    toScreenId: 'screen-472',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-878',
    kind: 'entrance',
    fromScreenId: 'screen-247',
    toScreenId: 'screen-473',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
    requirements: canUseBombs,
  },
  {
    id: 'connection-879',
    kind: 'entrance',
    fromScreenId: 'screen-249',
    toScreenId: 'screen-471',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
];

export { DW_HOUSES_CONNECTIONS };
