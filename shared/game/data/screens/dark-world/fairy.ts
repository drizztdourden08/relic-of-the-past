/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const DW_FAIRY_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-460',
    gameId: { roomIndex: 249 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    randomizerName: 'Bonk Fairy (Dark)',
    areaId: 'area-007',
    locationId: 'location-008',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-056', tile: { x: 52, y: 10 } },
      { actorId: 'actor-056', tile: { x: 42, y: 30 } },
      { actorId: 'actor-056', tile: { x: 34, y: 38 } },
      { actorId: 'actor-056', tile: { x: 24, y: 46 } },
    ],
  },
  {
    id: 'screen-461',
    gameId: { roomIndex: 250 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    randomizerName: 'Dark Lake Hylia Healer Fairy',
    areaId: 'area-004',
    locationId: 'location-006',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-255', tile: { x: 46, y: 28 } },
      { actorId: 'actor-255', tile: { x: 48, y: 32 } },
      { actorId: 'actor-255', tile: { x: 42, y: 34 } },
    ],
  },
  {
    id: 'screen-462',
    gameId: { roomIndex: 250 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    randomizerName: 'Dark Lake Hylia Ledge Healer Fairy',
    areaId: 'area-004',
    locationId: 'location-006',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-255', tile: { x: 46, y: 28 } },
      { actorId: 'actor-255', tile: { x: 48, y: 32 } },
      { actorId: 'actor-255', tile: { x: 42, y: 34 } },
    ],
  },
  {
    id: 'screen-456',
    gameId: { roomIndex: 234 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    randomizerName: 'Dark Desert Healer Fairy',
    areaId: 'area-005',
    locationId: 'location-026',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-262', tile: { x: 22, y: 22 } },
    ],
  },
  {
    id: 'screen-454',
    gameId: { roomIndex: 223 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    randomizerName: 'Dark Death Mountain Healer Fairy',
    areaId: 'area-002',
    locationId: 'location-004',
    tags: ['tag-003'],
    spawns: [
      { actorId: 'actor-056', tile: { x: 24, y: 42 } },
      { actorId: 'actor-056', tile: { x: 24, y: 44 } },
    ],
  },
  {
    id: 'screen-484',
    gameId: { roomIndex: 289 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'fairy',
    randomizerName: 'Pyramid Fairy',
    areaId: 'area-003',
    locationId: 'location-005',
    tags: ['tag-003', 'tag-024'],
    spawns: [
      { actorId: 'actor-002', tile: { x: 8, y: 46 } },
    ],
  },
];

export { DW_FAIRY_SCREENS };
