/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const DW_PASSAGES_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-463',
    gameId: { roomIndex: 253 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'passage',
    randomizerName: 'Superbunny Cave (Top)',
    areaId: 'area-002',
    locationId: 'location-004',
    tags: ['tag-003', 'tag-011'],
    spawns: [
      { actorId: 'actor-056', tile: { x: 18, y: 28 } },
      { actorId: 'actor-071', tile: { x: 10, y: 16 } },
      { actorId: 'actor-255', tile: { x: 44, y: 16 } },
      { actorId: 'actor-255', tile: { x: 48, y: 16 } },
      { actorId: 'actor-071', tile: { x: 30, y: 34 } },
    ],
  },
  {
    id: 'screen-457',
    gameId: { roomIndex: 237 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'passage',
    randomizerName: 'Superbunny Cave (Bottom)',
    areaId: 'area-002',
    locationId: 'location-004',
    tags: ['tag-003', 'tag-011', 'tag-024'],
  },
];

export { DW_PASSAGES_SCREENS };
