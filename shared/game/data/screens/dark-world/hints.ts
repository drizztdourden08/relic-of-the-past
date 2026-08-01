/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const DW_HINTS_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-467',
    gameId: { roomIndex: 270 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    randomizerName: 'Dark Desert Hint',
    areaId: 'area-005',
    locationId: 'location-026',
    tags: ['env:underground'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-165', tile: { x: 12, y: 12 } },
      { actorId: 'actor-165', tile: { x: 48, y: 12 } },
    ],
  },
  {
    id: 'screen-480',
    gameId: { roomIndex: 283 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    randomizerName: 'Fortune Teller (Dark)',
    areaId: 'area-017',
    locationId: 'location-031',
    tags: ['env:indoor'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-262', tile: { x: 48, y: 18 } },
      { actorId: 'actor-262', tile: { x: 10, y: 44 } },
    ],
  },
  {
    id: 'screen-481',
    gameId: { roomIndex: 284 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    randomizerName: 'Dark Sanctuary Hint',
    areaId: 'area-017',
    locationId: 'location-031',
    tags: ['env:indoor'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-225', tile: { x: 18, y: 50 } },
    ],
  },
  {
    id: 'screen-486',
    gameId: { roomIndex: 290 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    randomizerName: 'Palace of Darkness Hint',
    areaId: 'area-003',
    locationId: 'location-005',
    tags: ['env:underground'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-170', tile: { x: 14, y: 48 } },
      { actorId: 'actor-170', tile: { x: 46, y: 48 } },
    ],
  },
  {
    id: 'screen-485',
    gameId: { roomIndex: 290 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    randomizerName: 'East Dark World Hint',
    areaId: 'area-003',
    locationId: 'location-005',
    tags: ['env:underground'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-170', tile: { x: 14, y: 48 } },
      { actorId: 'actor-170', tile: { x: 46, y: 48 } },
    ],
  },
  {
    id: 'screen-479',
    gameId: { roomIndex: 282 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'hint',
    randomizerName: 'Dark Lake Hylia Ledge Hint',
    areaId: 'area-004',
    locationId: 'location-006',
    tags: ['env:underground'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-165', tile: { x: 48, y: 46 } },
    ],
  },
];

export { DW_HINTS_SCREENS };
