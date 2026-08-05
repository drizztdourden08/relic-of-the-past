/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../../types';

const DW_DUNGEON_SWAMP_PALACE_SCREENS_FLOOR_0: ScreenRecord[] = [
  {
    id: 'screen-341',
    gameId: { roomIndex: 40, palaceIndex: 10 },
    kind: 'dungeon',
    world: 'dark',
    randomizerName: 'Entrance Hall',
    areaId: 'area-007',
    locationId: 'location-027',
    position: { gridX: 8, gridY: 2, floor: 0 },
    tags: ['tag-003', 'tag-005'],
    triggerIds: ['actor-271'],
    spawns: [
      { actorId: 'actor-214', tile: { x: 20, y: 12 } },
      { actorId: 'actor-109', tile: { x: 16, y: 16 } },
      { actorId: 'actor-109', tile: { x: 22, y: 20 } },
      { actorId: 'actor-109', tile: { x: 14, y: 26 } },
      { actorId: 'actor-207', tile: { x: 16, y: 32 } },
    ],
  },
];

export { DW_DUNGEON_SWAMP_PALACE_SCREENS_FLOOR_0 };
