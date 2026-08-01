/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';
import { canUseBombs } from '../../requirements/helpers';

const LW_FAIRY_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-338',
    kind: 'entrance',
    fromScreenId: 'screen-069',
    toScreenId: 'screen-196',
    direction: 'two-way',
    tags: ['transit:bonk', 'dir:two-way', 'ctx:entrance', 'barrier:dash'],
    requirements: { itemId: 'item-076' },
  },
  {
    id: 'connection-339',
    kind: 'entrance',
    fromScreenId: 'screen-024',
    toScreenId: 'screen-217',
    direction: 'two-way',
    tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-340',
    kind: 'entrance',
    fromScreenId: 'screen-092',
    toScreenId: 'screen-218',
    placement: { at: 'area', rect: { x: 12, y: 2, w: 2, h: 2 } },
    direction: 'two-way',
    tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance', 'barrier:swim'],
    requirements: { itemId: 'item-031' },
  },
  {
    id: 'connection-341',
    kind: 'entrance',
    fromScreenId: 'screen-042',
    toScreenId: 'screen-218',
    direction: 'two-way',
    tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance', 'barrier:swim'],
  },
  {
    id: 'connection-342',
    kind: 'hole',
    fromScreenId: 'screen-053',
    toScreenId: 'screen-162',
    direction: 'one-way',
    tags: ['dir:one-way', 'ctx:entrance'],
  },
  {
    id: 'connection-343',
    kind: 'entrance',
    fromScreenId: 'screen-162',
    toScreenId: 'screen-053',
    direction: 'one-way',
    tags: ['dir:one-way', 'ctx:exit'],
  },
  {
    id: 'connection-344',
    kind: 'entrance',
    fromScreenId: 'screen-081',
    toScreenId: 'screen-197',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-345',
    kind: 'entrance',
    fromScreenId: 'screen-074',
    toScreenId: 'screen-188',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
    requirements: canUseBombs,
  },
  {
    id: 'connection-346',
    kind: 'entrance',
    fromScreenId: 'screen-034',
    toScreenId: 'screen-187',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-347',
    kind: 'entrance',
    fromScreenId: 'screen-073',
    toScreenId: 'screen-159',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-348',
    kind: 'entrance',
    fromScreenId: 'screen-016',
    toScreenId: 'screen-186',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
];

export { LW_FAIRY_CONNECTIONS };
