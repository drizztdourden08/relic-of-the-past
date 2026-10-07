/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_INTERIORS_EAST_HYRULE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-218',
    gameId: { roomIndex: 276, entranceId: 92 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'fairy',
    name: 'Waterfall of Wishing',
    areaId: 'area-010',
    locationId: 'location-012',
    regionId: 'region-060',
    tags: ['tag-003', 'tag-004', 'tag-024'],
    spawns: [
      { actorId: 'actor-198', tile: { x: 14, y: 48 } },
      { actorId: 'actor-165', tile: { x: 50, y: 40 } },
    ],
  },
  {
    id: 'screen-159',
    gameId: { roomIndex: 286, entranceId: 85 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'fairy',
    name: 'Long Fairy Cave',
    areaId: 'area-010',
    locationId: 'location-012',
    regionId: 'region-102',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-255', tile: { x: 10, y: 14 } },
      { actorId: 'actor-255', tile: { x: 12, y: 14 } },
      { actorId: 'actor-255', tile: { x: 10, y: 16 } },
      { actorId: 'actor-255', tile: { x: 12, y: 16 } },
      { actorId: 'actor-230', tile: { x: 48, y: 44 } },
    ],
  },
  {
    id: 'screen-209',
    gameId: { roomIndex: 261, entranceId: 69 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'house',
    name: 'Sahasrahla\'s Hut',
    areaId: 'area-010',
    locationId: 'location-012',
    regionId: 'region-088',
    tags: ['tag-002', 'tag-024'],
    spawns: [
      { actorId: 'actor-001', tile: { x: 14, y: 48 } },
    ],
  },
  {
    id: 'screen-197',
    gameId: { roomIndex: 277, entranceId: 94 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'fairy',
    name: 'Lake Hylia Healer Fairy',
    areaId: 'area-010',
    locationId: 'location-012',
    regionId: 'region-079',
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

export { LW_INTERIORS_EAST_HYRULE_SCREENS };
