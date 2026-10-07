/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_INTERIORS_DARK_LAKE_HYLIA_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-477',
    gameId: { roomIndex: 293, entranceId: 112 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'cave',
    name: 'Dark Lake Hylia Ledge Spike Cave',
    areaId: 'area-004',
    locationId: 'location-006',
    regionId: 'region-139',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-230', tile: { x: 16, y: 44 } },
    ],
  },
  {
    id: 'screen-462',
    gameId: { roomIndex: 277, entranceId: 94 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    name: 'Dark Lake Hylia Ledge Healer Fairy',
    areaId: 'area-004',
    locationId: 'location-006',
    regionId: 'region-083',
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
    id: 'screen-479',
    gameId: { roomIndex: 270, entranceId: 106 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    name: 'Dark Lake Hylia Ledge Hint',
    areaId: 'area-004',
    locationId: 'location-006',
    regionId: 'region-138',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-165', tile: { x: 12, y: 12 } },
      { actorId: 'actor-165', tile: { x: 48, y: 12 } },
    ],
  },
  {
    id: 'screen-483',
    gameId: { roomIndex: 271, entranceId: 96 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'shop',
    name: 'Dark Lake Hylia Shop',
    areaId: 'area-004',
    locationId: 'location-006',
    regionId: 'region-143',
    tags: ['tag-002'],
    spawns: [
      { actorId: 'actor-230', tile: { x: 14, y: 42 } },
    ],
  },
  {
    id: 'screen-455',
    gameId: { roomIndex: 286, entranceId: 61 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'cave',
    name: 'Hype Cave',
    areaId: 'area-004',
    locationId: 'location-006',
    regionId: 'region-140',
    tags: ['tag-003', 'tag-024'],
    spawns: [
      { actorId: 'actor-255', tile: { x: 10, y: 14 } },
      { actorId: 'actor-255', tile: { x: 12, y: 14 } },
      { actorId: 'actor-255', tile: { x: 10, y: 16 } },
      { actorId: 'actor-255', tile: { x: 12, y: 16 } },
      { actorId: 'actor-230', tile: { x: 48, y: 44 } },
    ],
  },
];

export { DW_INTERIORS_DARK_LAKE_HYLIA_SCREENS };
