/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';

const LW_WELLS_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-404',
    kind: 'hole',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-221',
    placement: { at: 'area', rect: { x: 22, y: 24, w: 2, h: 2 } },
    direction: 'one-way',
    tags: ['tag-072', 'tag-074'],
  },
  {
    id: 'connection-405',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-224',
    placement: { at: 'area', rect: { x: 22, y: 24, w: 2, h: 2 } },
    direction: 'two-way',
    counterpartId: 'connection-407',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-406',
    kind: 'hole',
    fromScreenId: 'screen-221',
    toScreenId: 'screen-224',
    direction: 'one-way',
    tags: ['tag-072', 'tag-076'],
  },
  {
    id: 'connection-407',
    kind: 'entrance',
    fromScreenId: 'screen-224',
    toScreenId: 'screen-031',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 47, end: 48 } },
    direction: 'two-way',
    counterpartId: 'connection-405',
    tags: ['tag-073', 'tag-075'],
  },
];

export { LW_WELLS_CONNECTIONS };
