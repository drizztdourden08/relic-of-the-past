/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../../types';

const LW_DUNGEON_DESERT_PALACE_SCREENS_FLOOR_B1: ScreenRecord[] = [
  {
    id: 'screen-130',
    gameId: { roomIndex: 116, palaceIndex: 6 },
    kind: 'dungeon',
    world: 'light',
    randomizerName: 'Big Key Room',
    areaId: 'area-009',
    locationId: 'location-011',
    position: { gridX: 4, gridY: 7, floor: -1 },
    tags: ['env:underground', 'loot:chest'],
    status: 'mapped',
    triggerIds: ['actor-043'],
    spawns: [
      { actorId: 'actor-098', tile: { x: 16, y: 48 } },
      { actorId: 'actor-098', tile: { x: 46, y: 48 } },
      { actorId: 'actor-111', tile: { x: 24, y: 10 } },
      { actorId: 'actor-111', tile: { x: 38, y: 10 } },
      { actorId: 'actor-104', tile: { x: 24, y: 20 } },
      { actorId: 'actor-104', tile: { x: 38, y: 20 } },
      { actorId: 'actor-104', tile: { x: 28, y: 54 } },
      { actorId: 'actor-104', tile: { x: 36, y: 54 } },
    ],
  },
  {
    id: 'screen-131',
    gameId: { roomIndex: 117, palaceIndex: 6 },
    kind: 'dungeon',
    world: 'light',
    randomizerName: 'Compass Room',
    areaId: 'area-009',
    locationId: 'location-011',
    position: { gridX: 5, gridY: 7, floor: -1 },
    tags: ['env:underground', 'loot:chest'],
    status: 'mapped',
    triggerIds: ['actor-024'],
    spawns: [
      { actorId: 'actor-098', tile: { x: 16, y: 14 } },
      { actorId: 'actor-098', tile: { x: 8, y: 54 } },
      { actorId: 'actor-104', tile: { x: 12, y: 10 } },
      { actorId: 'actor-104', tile: { x: 20, y: 10 } },
      { actorId: 'actor-104', tile: { x: 12, y: 20 } },
      { actorId: 'actor-104', tile: { x: 20, y: 20 } },
      { actorId: 'actor-193', tile: { x: 34, y: 22 } },
      { actorId: 'actor-194', tile: { x: 60, y: 22 } },
      { actorId: 'actor-104', tile: { x: 14, y: 50 } },
      { actorId: 'actor-104', tile: { x: 18, y: 50 } },
    ],
  },
];

export { LW_DUNGEON_DESERT_PALACE_SCREENS_FLOOR_B1 };
