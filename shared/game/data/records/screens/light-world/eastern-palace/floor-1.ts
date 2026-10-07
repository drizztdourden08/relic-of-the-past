/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_EASTERN_PALACE_FLOOR_1_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-140',
    gameId: { roomIndex: 137, palaceIndex: 4 },
    kind: 'dungeon',
    world: 'light',
    name: 'Eyegore Key Room',
    areaId: 'area-010',
    locationId: 'location-013',
    regionId: 'region-168',
    position: { gridX: 9, gridY: 8, floor: 1 },
    tags: ['tag-003', 'tag-015'],
    spawns: [
      { actorId: 'actor-255', tile: { x: 32, y: 20 } },
      { actorId: 'actor-255', tile: { x: 30, y: 22 } },
    ],
  },
  {
    id: 'screen-141',
    gameId: { roomIndex: 153, palaceIndex: 4 },
    kind: 'dungeon',
    world: 'light',
    name: 'Stalfos Spawn',
    areaId: 'area-010',
    locationId: 'location-013',
    regionId: 'region-168',
    position: { gridX: 9, gridY: 9, floor: 1 },
    tags: ['tag-003', 'tag-011'],
    spawns: [
      { actorId: 'actor-065', tile: { x: 42, y: 12 } },
      { actorId: 'actor-065', tile: { x: 52, y: 16 } },
      { actorId: 'actor-111', tile: { x: 28, y: 46 } },
      { actorId: 'actor-111', tile: { x: 34, y: 46 } },
      { actorId: 'actor-088', tile: { x: 26, y: 48 } },
      { actorId: 'actor-088', tile: { x: 36, y: 48 } },
      { actorId: 'actor-089', tile: { x: 28, y: 50 } },
      { actorId: 'actor-089', tile: { x: 30, y: 50 } },
      { actorId: 'actor-089', tile: { x: 32, y: 50 } },
      { actorId: 'actor-089', tile: { x: 34, y: 50 } },
    ],
  },
];

export { LW_EASTERN_PALACE_FLOOR_1_SCREENS };
