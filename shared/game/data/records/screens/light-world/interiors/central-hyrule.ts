/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_INTERIORS_CENTRAL_HYRULE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-204',
    gameId: { roomIndex: 260, entranceId: 1 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'house',
    name: 'Starting House',
    areaId: 'area-001',
    locationId: 'location-002',
    regionId: 'region-064',
    tags: ['tag-002', 'tag-013', 'tag-014'],
    spawns: [
      { actorId: 'actor-011', tile: { x: 52, y: 46 } },
    ],
  },
  {
    id: 'screen-205',
    gameId: { roomIndex: 260, entranceId: 0 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'house',
    name: 'Starting House (Intro)',
    areaId: 'area-001',
    locationId: 'location-002',
    regionId: 'region-064',
    tags: ['tag-002', 'tag-013', 'tag-014'],
    // The opening scene of room 0x104, the same room screen-204 holds. No door of its own
    // opens into it, so it carries no entranceId; `variant` is what picks it, and the
    // variant branch in detection.ts is what reads that.
    variant: { key: 'intro', progressTier: 0, condition: { type: 'progress', max: 0 } },
    spawns: [
      { actorId: 'actor-011', tile: { x: 52, y: 46 } },
    ],
  },
  {
    id: 'screen-196',
    gameId: { roomIndex: 294, entranceId: 113 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'fairy',
    name: 'Bonk Fairy (Light)',
    areaId: 'area-001',
    locationId: 'location-002',
    regionId: 'region-077',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-255', tile: { x: 14, y: 42 } },
      { actorId: 'actor-255', tile: { x: 16, y: 42 } },
      { actorId: 'actor-255', tile: { x: 14, y: 44 } },
      { actorId: 'actor-255', tile: { x: 16, y: 44 } },
      { actorId: 'actor-262', tile: { x: 56, y: 40 } },
    ],
  },
];

export { LW_INTERIORS_CENTRAL_HYRULE_SCREENS };
