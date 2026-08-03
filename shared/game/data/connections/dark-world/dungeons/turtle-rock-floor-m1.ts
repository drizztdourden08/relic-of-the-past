/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../../types';

const DW_DUNGEON_TURTLE_ROCK_FLOOR_M1_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-773',
    kind: 'door',
    fromScreenId: 'screen-416',
    toScreenId: 'screen-426',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 15, end: 16 } },
    direction: 'two-way',
    dungeonId: 'dungeon-012',
    tags: ['tag-073', 'tag-076'],
  },
  {
    id: 'connection-774',
    kind: 'edge',
    fromScreenId: 'screen-426',
    toScreenId: 'screen-427',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    dungeonId: 'dungeon-012',
    tags: ['tag-073', 'tag-076', 'tag-062'],
  },
  {
    id: 'connection-775',
    kind: 'edge',
    fromScreenId: 'screen-427',
    toScreenId: 'screen-428',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    dungeonId: 'dungeon-012',
    tags: ['tag-073', 'tag-076'],
  },
  {
    id: 'connection-776',
    kind: 'door',
    fromScreenId: 'screen-427',
    toScreenId: 'screen-438',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 15, end: 16 } },
    direction: 'two-way',
    dungeonId: 'dungeon-012',
    gatedBy: 'actor-028',
    tags: ['tag-073', 'tag-076'],
  },
  {
    id: 'connection-777',
    kind: 'edge',
    fromScreenId: 'screen-428',
    toScreenId: 'screen-429',
    placement: { at: 'side', side: 'east' },
    direction: 'two-way',
    dungeonId: 'dungeon-012',
    tags: ['tag-073', 'tag-076'],
  },
  {
    id: 'connection-778',
    kind: 'door',
    fromScreenId: 'screen-428',
    toScreenId: 'screen-439',
    placement: { at: 'side', side: 'south' },
    direction: 'two-way',
    dungeonId: 'dungeon-012',
    tags: ['tag-073', 'tag-076'],
  },
  {
    id: 'connection-779',
    kind: 'door',
    fromScreenId: 'screen-429',
    toScreenId: 'screen-440',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 15, end: 16 } },
    direction: 'two-way',
    dungeonId: 'dungeon-012',
    tags: ['tag-073', 'tag-076'],
  },
];

export { DW_DUNGEON_TURTLE_ROCK_FLOOR_M1_CONNECTIONS };
