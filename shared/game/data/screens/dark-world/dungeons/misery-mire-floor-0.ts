/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../../types';

const DW_DUNGEON_MISERY_MIRE_SCREENS_FLOOR_0: ScreenRecord[] = [
  {
    id: 'screen-406',
    gameId: { roomIndex: 152, palaceIndex: 14 },
    kind: 'dungeon',
    world: 'dark',
    randomizerName: 'Entrance Hall',
    areaId: 'area-005',
    locationId: 'location-020',
    position: { gridX: 8, gridY: 9, floor: 0 },
    tags: ['tag-003', 'tag-005', 'tag-009'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-118', tile: { x: 32, y: 38 } },
      { actorId: 'actor-118', tile: { x: 18, y: 40 } },
      { actorId: 'actor-118', tile: { x: 24, y: 40 } },
      { actorId: 'actor-118', tile: { x: 30, y: 40 } },
      { actorId: 'actor-118', tile: { x: 16, y: 46 } },
    ],
  },
];

export { DW_DUNGEON_MISERY_MIRE_SCREENS_FLOOR_0 };
