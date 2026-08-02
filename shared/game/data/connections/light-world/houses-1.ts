/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../types';
import { canUseBombs } from '../../requirements/helpers';
import { canBombOrBonk } from '../../requirements/helpers';

const LW_HOUSES_1_CONNECTIONS: ConnectionRecord[] = [

  {
    id: 'connection-001',
    kind: 'teleport',
    fromScreenId: 'screen-038',
    toScreenId: 'screen-204',
    direction: 'one-way',
    tags: ['tag-072', 'tag-078'],
  },
  {
    id: 'connection-002',
    kind: 'entrance',
    fromScreenId: 'screen-204',
    toScreenId: 'screen-027',
    placement: { at: 'side', side: 'south', tileRange: { axis: 'x', start: 47, end: 48 } },
    direction: 'one-way',
    tags: ['tag-072', 'tag-075', 'tag-065'],
  },
  {
    id: 'connection-353',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-210',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-354',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-206',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-355',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-207',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-356',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-208',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-357',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-211',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-358',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-203',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-359',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-212',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
    requirements: canUseBombs,
  },
  {
    id: 'connection-360',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-202',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-361',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-200',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-362',
    kind: 'entrance',
    fromScreenId: 'screen-031',
    toScreenId: 'screen-201',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
  {
    id: 'connection-363',
    kind: 'entrance',
    fromScreenId: 'screen-055',
    toScreenId: 'screen-223',
    direction: 'two-way',
    tags: ['tag-073', 'tag-074'],
  },
];

export { LW_HOUSES_1_CONNECTIONS };
