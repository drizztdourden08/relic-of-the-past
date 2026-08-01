/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../../types';

const DW_DUNGEON_SWAMP_PALACE_FLOOR_0_CONNECTIONS: ConnectionRecord[] = [

  {
    id: 'connection-635',
    kind: 'entrance',
    fromScreenId: 'screen-284',
    toScreenId: 'screen-341',
    placement: { at: 'area', rect: { x: 46, y: 28, w: 2, h: 2 } },
    direction: 'two-way',
    dungeonId: 'dungeon-007',
    tags: ['dir:two-way', 'ctx:dungeon-enter'],
  },
  {
    id: 'connection-641',
    kind: 'stairs',
    fromScreenId: 'screen-341',
    toScreenId: 'screen-350',
    placement: { at: 'area', rect: { x: 15, y: 3, w: 2, h: 2 } },
    direction: 'two-way',
    counterpartId: 'connection-648',
    dungeonId: 'dungeon-007',
    tags: ['dir:two-way', 'ctx:internal'],
  },
  {
    id: 'connection-654',
    kind: 'entrance',
    fromScreenId: 'screen-341',
    toScreenId: 'screen-283',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 31, end: 32 } },
    direction: 'two-way',
    dungeonId: 'dungeon-007',
    tags: ['dir:two-way', 'ctx:exit'],
  },
];

export { DW_DUNGEON_SWAMP_PALACE_FLOOR_0_CONNECTIONS };
