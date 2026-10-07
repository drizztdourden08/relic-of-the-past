/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_INTERIORS_LOST_WOODS_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-176',
    gameId: { roomIndex: 225, entranceId: 122 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'cave',
    name: 'Lost Woods Hideout (top)',
    areaId: 'area-014',
    locationId: 'location-019',
    regionId: 'region-095',
    tags: ['tag-003', 'tag-040'],
    spawns: [
      { actorId: 'actor-262', tile: { x: 46, y: 26 } },
      { actorId: 'actor-073', tile: { x: 14, y: 36 } },
    ],
  },
  {
    id: 'screen-175',
    gameId: { roomIndex: 225, entranceId: 44 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'cave',
    name: 'Lost Woods Hideout (bottom)',
    areaId: 'area-014',
    locationId: 'location-019',
    regionId: 'region-096',
    tags: ['tag-003', 'tag-024'],
    spawns: [
      { actorId: 'actor-262', tile: { x: 46, y: 26 } },
      { actorId: 'actor-073', tile: { x: 14, y: 36 } },
    ],
  },
  {
    id: 'screen-215',
    gameId: { roomIndex: 256, entranceId: 60 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'gamble',
    name: 'Lost Woods Gamble',
    areaId: 'area-014',
    locationId: 'location-019',
    regionId: 'region-116',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-230', tile: { x: 22, y: 54 } },
    ],
  },
];

export { LW_INTERIORS_LOST_WOODS_SCREENS };
