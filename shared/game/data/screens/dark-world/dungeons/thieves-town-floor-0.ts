/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../../types';

const DW_DUNGEON_THIEVES_TOWN_SCREENS_FLOOR_0: ScreenRecord[] = [
  {
    id: 'screen-420',
    gameId: { roomIndex: 172, palaceIndex: 22 },
    kind: 'dungeon',
    world: 'dark',
    randomizerName: 'Blind the Thief',
    areaId: 'area-017',
    locationId: 'location-028',
    position: { gridX: 12, gridY: 10, floor: 0 },
    tags: ['tag-003', 'tag-006'],
    status: 'mapped',
    triggerIds: ['actor-041'],
    spawns: [
      { actorId: 'actor-149', tile: { x: 50, y: 42 } },
    ],
  },
  {
    id: 'screen-449',
    gameId: { roomIndex: 220, palaceIndex: 22 },
    kind: 'dungeon',
    world: 'dark',
    randomizerName: 'Compass Room',
    areaId: 'area-017',
    locationId: 'location-028',
    position: { gridX: 12, gridY: 13, floor: 0 },
    tags: ['tag-003'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-125', tile: { x: 18, y: 20 } },
      { actorId: 'actor-095', tile: { x: 28, y: 20 } },
      { actorId: 'actor-126', tile: { x: 30, y: 24 } },
      { actorId: 'actor-118', tile: { x: 22, y: 32 } },
      { actorId: 'actor-118', tile: { x: 44, y: 32 } },
      { actorId: 'actor-239', tile: { x: 24, y: 44 } },
      { actorId: 'actor-126', tile: { x: 30, y: 44 } },
      { actorId: 'actor-125', tile: { x: 18, y: 46 } },
      { actorId: 'actor-108', tile: { x: 44, y: 46 } },
      { actorId: 'actor-108', tile: { x: 10, y: 56 } },
      { actorId: 'actor-118', tile: { x: 30, y: 56 } },
    ],
  },
];

export { DW_DUNGEON_THIEVES_TOWN_SCREENS_FLOOR_0 };
