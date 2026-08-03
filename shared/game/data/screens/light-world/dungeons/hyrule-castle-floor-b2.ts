/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../../types';

const LW_DUNGEON_HYRULE_CASTLE_SCREENS_FLOOR_B2: ScreenRecord[] = [
  {
    id: 'screen-099',
    gameId: { roomIndex: 1, palaceIndex: 2 },
    kind: 'dungeon',
    world: 'light',
    randomizerName: 'North Corridor',
    areaId: 'area-011',
    locationId: 'location-015',
    position: { gridX: 1, gridY: 0, floor: -2 },
    tags: ['tag-003', 'tag-016', 'tag-009'],
    status: 'mapped',
  },
  {
    id: 'screen-100',
    gameId: { roomIndex: 2, palaceIndex: 0 },
    kind: 'dungeon',
    world: 'light',
    randomizerName: 'Behind Sanctuary',
    areaId: 'area-011',
    locationId: 'location-015',
    position: { gridX: 2, gridY: 0, floor: -2 },
    tags: ['tag-003', 'tag-024'],
    status: 'mapped',
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
    randomizerName: 'Sewer Key Chest Room',
    areaId: 'area-011',
    locationId: 'location-015',
    position: { gridX: 2, gridY: 3, floor: -2 },
    tags: ['tag-003', 'tag-016'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-103', tile: { x: 22, y: 26 } },
      { actorId: 'actor-102', tile: { x: 30, y: 26 } },
      { actorId: 'actor-103', tile: { x: 38, y: 26 } },
      { actorId: 'actor-102', tile: { x: 32, y: 28 } },
      { actorId: 'actor-102', tile: { x: 36, y: 30 } },
    ],
  },
];

export { LW_DUNGEON_HYRULE_CASTLE_SCREENS_FLOOR_B2 };
