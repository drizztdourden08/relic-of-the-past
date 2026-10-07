/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_MISERY_MIRE_FLOOR_0_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-406',
    gameId: { roomIndex: 152, palaceIndex: 14, entranceId: 39 },
    kind: 'dungeon',
    world: 'dark',
    name: 'Entrance Hall',
    areaId: 'area-005',
    locationId: 'location-020',
    regionId: 'region-203',
    position: { gridX: 8, gridY: 9, floor: 0 },
    tags: ['tag-003', 'tag-005', 'tag-009'],
    spawns: [
      { actorId: 'actor-118', tile: { x: 32, y: 38 } },
      { actorId: 'actor-118', tile: { x: 18, y: 40 } },
      { actorId: 'actor-118', tile: { x: 24, y: 40 } },
      { actorId: 'actor-118', tile: { x: 30, y: 40 } },
      { actorId: 'actor-118', tile: { x: 16, y: 46 } },
    ],
  },
];

export { DW_MISERY_MIRE_FLOOR_0_SCREENS };
