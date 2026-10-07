/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_INTERIORS_DARK_NORTH_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-484',
    gameId: { roomIndex: 278, entranceId: 99 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    name: 'Pyramid Fairy',
    areaId: 'area-006',
    locationId: 'location-022',
    regionId: 'region-147',
    tags: ['tag-003', 'tag-024'],
    spawns: [
      { actorId: 'actor-198', tile: { x: 46, y: 48 } },
    ],
  },
  {
    id: 'screen-471',
    // The third door into room 0x112, entrance 90, opens on the dark sanctuary's screen.
    // The other two are the lake and mountain cave shops.
    gameId: { roomIndex: 274, entranceId: 90 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    name: 'Dark Sanctuary Hint',
    areaId: 'area-006',
    locationId: 'location-007',
    regionId: 'region-152',
    tags: ['tag-002', 'tag-024'],
    spawns: [
      { actorId: 'actor-165', tile: { x: 14, y: 20 } },
      { actorId: 'actor-230', tile: { x: 46, y: 40 } },
    ],
  },
];

export { DW_INTERIORS_DARK_NORTH_SCREENS };
