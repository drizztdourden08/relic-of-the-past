/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_INTERIORS_DARK_EAST_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-486',
    gameId: { roomIndex: 282, entranceId: 104 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    name: 'Palace of Darkness Hint',
    areaId: 'area-003',
    locationId: 'location-005',
    regionId: 'region-134',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-165', tile: { x: 48, y: 46 } },
    ],
  },
  {
    id: 'screen-485',
    gameId: { roomIndex: 270, entranceId: 105 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    name: 'East Dark World Hint',
    areaId: 'area-003',
    locationId: 'location-005',
    regionId: 'region-135',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-165', tile: { x: 12, y: 12 } },
      { actorId: 'actor-165', tile: { x: 48, y: 12 } },
    ],
  },
  {
    id: 'screen-461',
    gameId: { roomIndex: 277, entranceId: 94 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    name: 'Dark Lake Hylia Healer Fairy',
    areaId: 'area-003',
    locationId: 'location-005',
    regionId: 'region-082',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-238', tile: { x: 46, y: 44 } },
      { actorId: 'actor-255', tile: { x: 46, y: 14 } },
      { actorId: 'actor-255', tile: { x: 48, y: 14 } },
      { actorId: 'actor-255', tile: { x: 46, y: 16 } },
      { actorId: 'actor-255', tile: { x: 48, y: 16 } },
      { actorId: 'actor-198', tile: { x: 14, y: 18 } },
    ],
  },
];

export { DW_INTERIORS_DARK_EAST_SCREENS };
