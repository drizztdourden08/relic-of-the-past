/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../../types';
import { canLiftHeavyRocks } from '../../../requirements/helpers';

const LW_OVERWORLD_DESERT_1_CONNECTIONS: ConnectionRecord[] = [

  {
    id: 'connection-025',
    kind: 'edge',
    fromScreenId: 'screen-035',
    toScreenId: 'screen-015',
    direction: 'two-way',
    counterpartId: 'connection-027',
    tags: ['tag-073', 'tag-080'],
    requirements: { itemId: 'item-030' },
  },
  {
    id: 'connection-026',
    kind: 'stairs',
    fromScreenId: 'screen-015',
    toScreenId: 'screen-013',
    direction: 'one-way',
    tags: ['tag-072', 'tag-080', 'tag-070'],
  },
  {
    id: 'connection-027',
    kind: 'edge',
    fromScreenId: 'screen-015',
    toScreenId: 'screen-035',
    direction: 'one-way',
    counterpartId: 'connection-025',
    tags: ['tag-043', 'tag-072', 'tag-080'],
  },
  {
    id: 'connection-028',
    kind: 'edge',
    fromScreenId: 'screen-009',
    toScreenId: 'screen-035',
    direction: 'one-way',
    counterpartId: 'connection-184',
    tags: ['tag-043', 'tag-072', 'tag-080'],
  },
  {
    id: 'connection-029',
    kind: 'edge',
    fromScreenId: 'screen-010',
    toScreenId: 'screen-009',
    direction: 'one-way',
    tags: ['tag-043', 'tag-072', 'tag-080'],
  },
  {
    id: 'connection-030',
    kind: 'edge',
    fromScreenId: 'screen-014',
    toScreenId: 'screen-009',
    direction: 'one-way',
    tags: ['tag-043', 'tag-072', 'tag-080'],
  },
  {
    id: 'connection-031',
    kind: 'edge',
    fromScreenId: 'screen-011',
    toScreenId: 'screen-010',
    direction: 'one-way',
    tags: ['tag-043', 'tag-072', 'tag-080'],
  },
  {
    id: 'connection-047',
    kind: 'edge',
    fromScreenId: 'screen-002',
    toScreenId: 'screen-034',
    direction: 'one-way',
    tags: ['tag-043', 'tag-072', 'tag-080'],
  },
  {
    id: 'connection-051',
    kind: 'teleport',
    fromScreenId: 'screen-034',
    toScreenId: 'screen-238',
    direction: 'one-way',
    tags: ['tag-072', 'tag-077'],
    requirements: { allOf: [{ itemId: 'item-075' }, canLiftHeavyRocks] },
  },
  {
    id: 'connection-141',
    kind: 'edge',
    fromScreenId: 'screen-034',
    toScreenId: 'screen-049',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    tags: ['tag-073', 'tag-080'],
  },
  {
    id: 'connection-142',
    kind: 'edge',
    fromScreenId: 'screen-034',
    toScreenId: 'screen-035',
    placement: { at: 'side', side: 'south' },
    direction: 'two-way',
    tags: ['tag-073', 'tag-080'],
  },
  {
    id: 'connection-143',
    kind: 'edge',
    fromScreenId: 'screen-049',
    toScreenId: 'screen-057',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    tags: ['tag-073', 'tag-080'],
  },
];

export { LW_OVERWORLD_DESERT_1_CONNECTIONS };
