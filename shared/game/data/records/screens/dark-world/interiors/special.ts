/* @layer shared-game @kind data */
/** The screens no area owns. */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_INTERIORS_SPECIAL_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-452',
    gameId: { roomIndex: 0, entranceId: 123 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'special',
    name: 'Pyramid',
    areaId: 'area-006',
    locationId: 'location-022',
    regionId: 'region-162',
    tags: ['tag-002'],
    spawns: [
      { actorId: 'actor-150', tile: { x: 46, y: 10 } },
    ],
  },
  {
    id: 'screen-451',
    gameId: { roomIndex: 16, entranceId: 54 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'special',
    name: 'Bottom of Pyramid',
    areaId: 'area-006',
    locationId: 'location-022',
    regionId: 'region-163',
    tags: ['tag-002'],
  },
];

export { DW_INTERIORS_SPECIAL_SCREENS };
