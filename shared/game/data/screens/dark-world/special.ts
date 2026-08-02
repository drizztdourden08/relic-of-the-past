/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const DW_SPECIAL_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-452',
    gameId: { roomIndex: 98 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'special',
    randomizerName: 'Pyramid',
    areaId: 'area-003',
    locationId: 'location-005',
    tags: ['tag-002'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-076', tile: { x: 24, y: 16 } },
      { actorId: 'actor-077', tile: { x: 20, y: 26 } },
      { actorId: 'actor-077', tile: { x: 34, y: 28 } },
    ],
  },
  {
    id: 'screen-451',
    gameId: { roomIndex: 98 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'special',
    randomizerName: 'Bottom of Pyramid',
    areaId: 'area-003',
    locationId: 'location-005',
    tags: ['tag-002'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-076', tile: { x: 24, y: 16 } },
      { actorId: 'actor-077', tile: { x: 20, y: 26 } },
      { actorId: 'actor-077', tile: { x: 34, y: 28 } },
    ],
  },
];

export { DW_SPECIAL_SCREENS };
