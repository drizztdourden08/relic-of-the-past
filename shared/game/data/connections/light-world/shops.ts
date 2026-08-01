/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';
import { canUseBombs } from '../../requirements/helpers';

const LW_SHOPS_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-400',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-199',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-401',
    kind: 'entrance',
    fromScreenId: 'screen-081',
    toScreenId: 'screen-214',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
  {
    id: 'connection-402',
    kind: 'entrance',
    fromScreenId: 'screen-004',
    toScreenId: 'screen-213',
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
    requirements: canUseBombs,
  },
  {
    id: 'connection-403',
    kind: 'entrance',
    fromScreenId: 'screen-085',
    toScreenId: 'screen-220',
    placement: { at: 'area', rect: { x: 24, y: 40, w: 2, h: 2 } },
    direction: 'two-way',
    tags: ['dir:two-way', 'ctx:entrance'],
  },
];

export { LW_SHOPS_CONNECTIONS };
