/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../../types';

const LW_DUNGEON_EASTERN_PALACE_FLOOR_1_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-259',
    kind: 'hole',
    fromScreenId: 'screen-140',
    toScreenId: 'screen-144',
    direction: 'two-way',
    dungeonId: 'dungeon-003',
    tags: ['tag-073', 'tag-076', 'tag-058'],
  },
  {
    id: 'connection-260',
    kind: 'edge',
    fromScreenId: 'screen-140',
    toScreenId: 'screen-141',
    placement: { at: 'side', side: 'south' },
    direction: 'two-way',
    dungeonId: 'dungeon-003',
    tags: ['tag-073', 'tag-076'],
  },
  {
    id: 'connection-261',
    kind: 'stairs',
    fromScreenId: 'screen-141',
    toScreenId: 'screen-156',
    placement: { at: 'area', rect: { x: 15, y: 35, w: 2, h: 2 } },
    direction: 'two-way',
    dungeonId: 'dungeon-003',
    tags: ['tag-073', 'tag-076'],
  },
  {
    id: 'connection-262',
    kind: 'door',
    fromScreenId: 'screen-141',
    toScreenId: 'screen-144',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 31, end: 32 } },
    direction: 'two-way',
    dungeonId: 'dungeon-003',
    tags: ['tag-073', 'tag-076'],
  },
];

export { LW_DUNGEON_EASTERN_PALACE_FLOOR_1_CONNECTIONS };
