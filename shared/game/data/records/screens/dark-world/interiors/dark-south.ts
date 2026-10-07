/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_INTERIORS_DARK_SOUTH_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-460',
    gameId: { roomIndex: 294, entranceId: 113 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    name: 'Bonk Fairy (Dark)',
    areaId: 'area-007',
    locationId: 'location-008',
    regionId: 'region-078',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-255', tile: { x: 14, y: 42 } },
      { actorId: 'actor-255', tile: { x: 16, y: 42 } },
      { actorId: 'actor-255', tile: { x: 14, y: 44 } },
      { actorId: 'actor-255', tile: { x: 16, y: 44 } },
      { actorId: 'actor-262', tile: { x: 56, y: 40 } },
    ],
  },
  {
    id: 'screen-466',
    gameId: { roomIndex: 284, entranceId: 83 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'shop',
    name: 'Big Bomb Shop',
    areaId: 'area-007',
    locationId: 'location-008',
    regionId: 'region-136',
    tags: ['tag-002'],
    spawns: [
      { actorId: 'actor-225', tile: { x: 18, y: 50 } },
    ],
  },
];

export { DW_INTERIORS_DARK_SOUTH_SCREENS };
