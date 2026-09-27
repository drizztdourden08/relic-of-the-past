/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_HYRULE_CASTLE_FLOOR_B2_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-099',
    gameId: { roomIndex: 1, palaceIndex: 2 },
    kind: 'dungeon',
    world: 'light',
    name: 'North Corridor',
    areaId: 'area-011',
    locationId: 'location-015',
    regionId: 'region-169',
    position: { gridX: 1, gridY: 0, floor: -2 },
    tags: ['tag-003', 'tag-016', 'tag-009'],
  },
  {
    id: 'screen-100',
    gameId: { roomIndex: 2, palaceIndex: 0 },
    kind: 'dungeon',
    world: 'light',
    name: 'Behind Sanctuary',
    areaId: 'area-011',
    locationId: 'location-015',
    regionId: 'region-173',
    position: { gridX: 2, gridY: 0, floor: -2 },
    tags: ['tag-003', 'tag-024'],
    triggerIds: ['actor-025'],
    spawns: [
      { actorId: 'actor-101', tile: { x: 36, y: 10 } },
      { actorId: 'actor-101', tile: { x: 42, y: 12 } },
      { actorId: 'actor-101', tile: { x: 30, y: 16 } },
      { actorId: 'actor-101', tile: { x: 32, y: 16 } },
      { actorId: 'actor-101', tile: { x: 48, y: 18 } },
      { actorId: 'actor-154', tile: { x: 20, y: 46 } },
      { actorId: 'actor-152', tile: { x: 42, y: 46 } },
      { actorId: 'actor-101', tile: { x: 26, y: 52 } },
      { actorId: 'actor-101', tile: { x: 36, y: 52 } },
    ],
  },
  {
    id: 'screen-112',
    gameId: { roomIndex: 50, palaceIndex: 0 },
    kind: 'dungeon',
    world: 'light',
    name: 'Sewer Key Chest Room',
    areaId: 'area-011',
    locationId: 'location-015',
    regionId: 'region-171',
    position: { gridX: 2, gridY: 3, floor: -2 },
    tags: ['tag-003', 'tag-016'],
    spawns: [
      { actorId: 'actor-103', tile: { x: 22, y: 26 } },
      { actorId: 'actor-102', tile: { x: 30, y: 26 } },
      { actorId: 'actor-103', tile: { x: 38, y: 26 } },
      { actorId: 'actor-102', tile: { x: 32, y: 28 } },
      { actorId: 'actor-102', tile: { x: 36, y: 30 } },
    ],
  },
];

export { LW_HYRULE_CASTLE_FLOOR_B2_SCREENS };
