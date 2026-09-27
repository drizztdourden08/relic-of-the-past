/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_INTERIORS_SKULL_WOODS_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-475',
    gameId: { roomIndex: 271, entranceId: 96 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'shop',
    name: 'Dark World Lumberjack Shop',
    areaId: 'area-015',
    locationId: 'location-024',
    regionId: 'region-144',
    tags: ['tag-002'],
    spawns: [
      { actorId: 'actor-230', tile: { x: 14, y: 42 } },
    ],
  },
];

export { DW_INTERIORS_SKULL_WOODS_SCREENS };
