/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const DW_GAMBLE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-470',
    gameId: { roomIndex: 273 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'gamble',
    randomizerName: 'Chest Game',
    areaId: 'area-017',
    locationId: 'location-031',
    tags: ['tag-002', 'tag-024'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-192', tile: { x: 22, y: 54 } },
    ],
  },
  {
    id: 'screen-469',
    gameId: { roomIndex: 272 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'gamble',
    randomizerName: 'Archery Game',
    areaId: 'area-017',
    locationId: 'location-031',
    tags: ['tag-002'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-230', tile: { x: 14, y: 42 } },
    ],
  },
];

export { DW_GAMBLE_SCREENS };
