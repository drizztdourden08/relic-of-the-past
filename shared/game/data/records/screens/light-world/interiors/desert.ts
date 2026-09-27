/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_INTERIORS_DESERT_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-160',
    gameId: { roomIndex: 266, entranceId: 77 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'cave',
    name: 'Aginah\'s Cave',
    areaId: 'area-009',
    locationId: 'location-010',
    regionId: 'region-087',
    tags: ['tag-003', 'tag-024'],
    spawns: [
      { actorId: 'actor-001', tile: { x: 50, y: 8 } },
    ],
  },
  {
    id: 'screen-168',
    gameId: { roomIndex: 294, entranceId: 114 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'cave',
    name: 'Checkerboard Cave',
    areaId: 'area-009',
    locationId: 'location-010',
    regionId: 'region-101',
    tags: ['tag-003', 'tag-024'],
    spawns: [
      { actorId: 'actor-255', tile: { x: 14, y: 42 } },
      { actorId: 'actor-255', tile: { x: 16, y: 42 } },
      { actorId: 'actor-255', tile: { x: 14, y: 44 } },
      { actorId: 'actor-255', tile: { x: 16, y: 44 } },
      { actorId: 'actor-262', tile: { x: 56, y: 40 } },
    ],
  },
  {
    id: 'screen-187',
    gameId: { roomIndex: 277, entranceId: 94 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'fairy',
    name: 'Desert Healer Fairy',
    areaId: 'area-009',
    locationId: 'location-010',
    regionId: 'region-081',
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
    id: 'screen-158',
    gameId: { roomIndex: 292, entranceId: 109 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'cave',
    name: '50 Rupee Cave',
    areaId: 'area-009',
    locationId: 'location-010',
    regionId: 'region-115',
    tags: ['tag-003', 'tag-024'],
    spawns: [
      { actorId: 'actor-230', tile: { x: 16, y: 44 } },
    ],
  },
];

export { LW_INTERIORS_DESERT_SCREENS };
