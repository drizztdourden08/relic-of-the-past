/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const LW_GAMBLE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-219',
    gameId: { roomIndex: 283 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'gamble',
    randomizerName: 'Kakariko Gamble Game',
    areaId: 'area-012',
    locationId: 'location-017',
    tags: ['tag-002'],
    spawns: [
      { actorId: 'actor-262', tile: { x: 48, y: 18 } },
      { actorId: 'actor-262', tile: { x: 10, y: 44 } },
    ],
  },
  {
    id: 'screen-215',
    gameId: { roomIndex: 262 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'gamble',
    randomizerName: 'Lost Woods Gamble',
    areaId: 'area-014',
    locationId: 'location-019',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-230', tile: { x: 16, y: 54 } },
    ],
  },
];

export { LW_GAMBLE_SCREENS };
