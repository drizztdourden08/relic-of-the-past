/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_INTERIORS_SOUTH_HYRULE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-167',
    gameId: { roomIndex: 283, entranceId: 81 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'cave',
    name: 'Cave 45',
    areaId: 'area-016',
    locationId: 'location-025',
    regionId: 'region-099',
    tags: ['tag-003', 'tag-024'],
    spawns: [
      { actorId: 'actor-262', tile: { x: 48, y: 18 } },
      { actorId: 'actor-262', tile: { x: 10, y: 44 } },
    ],
  },
];

export { LW_INTERIORS_SOUTH_HYRULE_SCREENS };
