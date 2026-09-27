/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_INTERIORS_DARK_MIRE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-456',
    gameId: { roomIndex: 277, entranceId: 94 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    name: 'Dark Desert Healer Fairy',
    areaId: 'area-005',
    locationId: 'location-020',
    regionId: 'region-084',
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
  {
    id: 'screen-467',
    gameId: { roomIndex: 276, entranceId: 98 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    name: 'Dark Desert Hint',
    areaId: 'area-005',
    locationId: 'location-020',
    regionId: 'region-155',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-198', tile: { x: 14, y: 48 } },
      { actorId: 'actor-165', tile: { x: 50, y: 40 } },
    ],
  },
  {
    id: 'screen-472',
    gameId: { roomIndex: 269, entranceId: 95 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'house',
    name: 'Mire Shed',
    areaId: 'area-005',
    locationId: 'location-020',
    regionId: 'region-154',
    tags: ['tag-002', 'tag-024'],
    spawns: [
      { actorId: 'actor-094', tile: { x: 10, y: 44 } },
      { actorId: 'actor-095', tile: { x: 20, y: 44 } },
    ],
  },
];

export { DW_INTERIORS_DARK_MIRE_SCREENS };
