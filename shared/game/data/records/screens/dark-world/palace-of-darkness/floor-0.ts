/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const DW_PALACE_OF_DARKNESS_FLOOR_0_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-362',
    gameId: { roomIndex: 74, palaceIndex: 12, entranceId: 38 },
    kind: 'dungeon',
    world: 'dark',
    name: 'Entrance Hall',
    areaId: 'area-003',
    locationId: 'location-021',
    regionId: 'region-220',
    position: { gridX: 10, gridY: 4, floor: 0 },
    tags: ['tag-003', 'tag-005', 'tag-009'],
    triggerIds: ['actor-028'],
    spawns: [
      { actorId: 'actor-159', tile: { x: 40, y: 14 } },
      { actorId: 'actor-064', tile: { x: 16, y: 16 } },
      { actorId: 'actor-064', tile: { x: 48, y: 16 } },
    ],
  },
  {
    id: 'screen-363',
    gameId: { roomIndex: 75, palaceIndex: 12 },
    kind: 'dungeon',
    world: 'dark',
    name: 'Rupee Room',
    areaId: 'area-003',
    locationId: 'location-021',
    position: { gridX: 11, gridY: 4, floor: 0 },
    tags: ['tag-003', 'tag-024'],
    triggerIds: ['actor-024'],
    spawns: [
      { actorId: 'actor-112', tile: { x: 14, y: 8 } },
      { actorId: 'actor-065', tile: { x: 46, y: 10 } },
      { actorId: 'actor-065', tile: { x: 48, y: 12 } },
      { actorId: 'actor-111', tile: { x: 8, y: 16 } },
      { actorId: 'actor-111', tile: { x: 22, y: 16 } },
      { actorId: 'actor-071', tile: { x: 30, y: 48 } },
      { actorId: 'actor-071', tile: { x: 22, y: 50 } },
      { actorId: 'actor-071', tile: { x: 36, y: 50 } },
    ],
  },
];

export { DW_PALACE_OF_DARKNESS_FLOOR_0_SCREENS };
