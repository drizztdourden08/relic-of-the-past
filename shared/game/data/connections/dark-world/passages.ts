/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const DW_PASSAGES_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-880',
    kind: 'entrance',
    fromScreenId: 'screen-017',
    toScreenId: 'screen-463',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-881',
    kind: 'entrance',
    fromScreenId: 'screen-236',
    toScreenId: 'screen-463',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-882',
    kind: 'entrance',
    fromScreenId: 'screen-233',
    toScreenId: 'screen-457',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-883',
    kind: 'stairs',
    fromScreenId: 'screen-463',
    toScreenId: 'screen-457',
    placement: { at: 'area', rect: { x: 15, y: 3, w: 2, h: 2 } },
    direction: 'one-way',
    tags: ['tag-072', 'tag-076'],
  },
  {
    id: 'connection-884',
    kind: 'entrance',
    fromScreenId: 'screen-457',
    toScreenId: 'screen-016',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 47, end: 48 } },
    direction: 'two-way',
    tags: ['tag-073', 'tag-075'],
  },
];

export { DW_PASSAGES_CONNECTIONS };
