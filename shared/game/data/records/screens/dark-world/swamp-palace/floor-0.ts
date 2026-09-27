/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_SWAMP_PALACE_FLOOR_0_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-341',
    gameId: { roomIndex: 40, palaceIndex: 10, entranceId: 37 },
    kind: 'dungeon',
    world: 'dark',
    name: 'Entrance Hall',
    areaId: 'area-007',
    locationId: 'location-027',
    regionId: 'region-180',
    position: { gridX: 8, gridY: 2, floor: 0 },
    tags: ['tag-003', 'tag-005'],
    triggerIds: ['actor-271'],
    spawns: [
      { actorId: 'actor-214', tile: { x: 20, y: 12 } },
      { actorId: 'actor-109', tile: { x: 16, y: 16 } },
      { actorId: 'actor-109', tile: { x: 22, y: 20 } },
      { actorId: 'actor-109', tile: { x: 14, y: 26 } },
      { actorId: 'actor-207', tile: { x: 16, y: 32 } },
    ],
  },
];

export { DW_SWAMP_PALACE_FLOOR_0_SCREENS };
