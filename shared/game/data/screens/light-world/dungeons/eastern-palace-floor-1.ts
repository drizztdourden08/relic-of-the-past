/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../../types';

const LW_DUNGEON_EASTERN_PALACE_SCREENS_FLOOR_1: ScreenRecord[] = [
  {
    id: 'screen-140',
    gameId: { roomIndex: 137, palaceIndex: 4 },
    kind: 'dungeon',
    world: 'light',
    randomizerName: 'Eyegore Key Room',
    areaId: 'area-010',
    locationId: 'location-013',
    position: { gridX: 9, gridY: 8, floor: 1 },
    tags: ['env:underground', 'role:puzzle'],
    status: 'mapped',
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
    randomizerName: 'Stalfos Spawn',
    areaId: 'area-010',
    locationId: 'location-013',
    position: { gridX: 9, gridY: 9, floor: 1 },
    tags: ['env:underground', 'role:connector'],
    status: 'mapped',
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

export { LW_DUNGEON_EASTERN_PALACE_SCREENS_FLOOR_1 };
