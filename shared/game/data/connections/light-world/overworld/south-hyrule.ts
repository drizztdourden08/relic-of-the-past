/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ConnectionRecord } from '../../../types';

const LW_OVERWORLD_SOUTH_HYRULE_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'connection-046',
    screenId: 'screen-003',
    toConnectionId: 'connection-191',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-043', 'tag-080'],
  },
  {
    id: 'connection-145',
    screenId: 'screen-057',
    toConnectionId: 'connection-1598',
    kind: 'edge',
    placement: { form: 'border', side: 'east', rect: { x: 63, y: 0, w: 1, h: 64 }, tiles: [] },
    canExit: true,
    tags: ['tag-080'],
  },
  {
    id: 'connection-146',
    screenId: 'screen-057',
    toConnectionId: 'connection-1599',
    kind: 'edge',
    placement: { form: 'border', side: 'south', rect: { x: 0, y: 63, w: 64, h: 1 }, tiles: [] },
    canExit: true,
    tags: ['tag-080'],
  },
  {
    id: 'connection-191',
    screenId: 'screen-057',
    toConnectionId: 'connection-046',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: ['tag-080'],
  },
  {
    id: 'connection-1598',
    screenId: 'screen-065',
    toConnectionId: 'connection-145',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
  {
    id: 'connection-1599',
    screenId: 'screen-058',
    toConnectionId: 'connection-146',
    kind: 'edge',
    placement: { form: 'area', tiles: [], rect: { x: 0, y: 0, w: 0, h: 0 } },
    canExit: true,
    tags: [],
  },
];

export { LW_OVERWORLD_SOUTH_HYRULE_CONNECTIONS };
