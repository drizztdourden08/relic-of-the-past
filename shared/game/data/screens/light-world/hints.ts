/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const LW_HINTS_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-183',
    gameId: { roomIndex: 231 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'hint',
    randomizerName: 'Fortune Teller (Light)',
    areaId: 'area-012',
    locationId: 'location-017',
    tags: ['tag-002'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-103', tile: { x: 32, y: 8 } },
      { actorId: 'actor-103', tile: { x: 38, y: 8 } },
      { actorId: 'actor-103', tile: { x: 42, y: 22 } },
      { actorId: 'actor-103', tile: { x: 22, y: 24 } },
      { actorId: 'actor-103', tile: { x: 22, y: 26 } },
      { actorId: 'actor-103', tile: { x: 42, y: 26 } },
      { actorId: 'actor-103', tile: { x: 42, y: 30 } },
    ],
  },
  {
    id: 'screen-184',
    gameId: { roomIndex: 231 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'hint',
    randomizerName: 'Lake Hylia Fortune Teller',
    areaId: 'area-013',
    locationId: 'location-018',
    tags: ['tag-002'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-103', tile: { x: 32, y: 8 } },
      { actorId: 'actor-103', tile: { x: 38, y: 8 } },
      { actorId: 'actor-103', tile: { x: 42, y: 22 } },
      { actorId: 'actor-103', tile: { x: 22, y: 24 } },
      { actorId: 'actor-103', tile: { x: 22, y: 26 } },
      { actorId: 'actor-103', tile: { x: 42, y: 26 } },
      { actorId: 'actor-103', tile: { x: 42, y: 30 } },
    ],
  },
];

export { LW_HINTS_SCREENS };
