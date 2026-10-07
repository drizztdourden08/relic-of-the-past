/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_DESERT_PALACE_FLOOR_B1_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-130',
    gameId: { roomIndex: 116, palaceIndex: 6 },
    kind: 'dungeon',
    world: 'light',
    name: 'Big Key Room',
    areaId: 'area-009',
    locationId: 'location-011',
    regionId: 'region-164',
    position: { gridX: 4, gridY: 7, floor: -1 },
    tags: ['tag-003', 'tag-024'],
    triggerIds: ['actor-043'],
    spawns: [
      { actorId: 'actor-098', tile: { x: 16, y: 48 } },
      { actorId: 'actor-098', tile: { x: 46, y: 48 } },
      { actorId: 'actor-111', tile: { x: 24, y: 10 } },
      { actorId: 'actor-111', tile: { x: 38, y: 10 } },
      { actorId: 'actor-104', tile: { x: 24, y: 20 } },
      { actorId: 'actor-104', tile: { x: 38, y: 20 } },
      { actorId: 'actor-104', tile: { x: 28, y: 54 } },
      { actorId: 'actor-104', tile: { x: 36, y: 54 } },
    ],
  },
  {
    id: 'screen-131',
    gameId: { roomIndex: 117, palaceIndex: 6 },
    kind: 'dungeon',
    world: 'light',
    name: 'Compass Room',
    areaId: 'area-009',
    locationId: 'location-011',
    regionId: 'region-166',
    position: { gridX: 5, gridY: 7, floor: -1 },
    tags: ['tag-003', 'tag-024'],
    triggerIds: ['actor-024'],
    spawns: [
      { actorId: 'actor-098', tile: { x: 16, y: 14 } },
      { actorId: 'actor-098', tile: { x: 8, y: 54 } },
      { actorId: 'actor-104', tile: { x: 12, y: 10 } },
      { actorId: 'actor-104', tile: { x: 20, y: 10 } },
      { actorId: 'actor-104', tile: { x: 12, y: 20 } },
      { actorId: 'actor-104', tile: { x: 20, y: 20 } },
      { actorId: 'actor-193', tile: { x: 34, y: 22 } },
      { actorId: 'actor-194', tile: { x: 60, y: 22 } },
      { actorId: 'actor-104', tile: { x: 14, y: 50 } },
      { actorId: 'actor-104', tile: { x: 18, y: 50 } },
    ],
  },
];

export { LW_DESERT_PALACE_FLOOR_B1_SCREENS };
