/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const LW_SHOPS_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-199',
    gameId: { roomIndex: 256 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'shop',
    randomizerName: 'Kakariko Shop',
    areaId: 'area-012',
    locationId: 'location-017',
    tags: ['tag-002'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-230', tile: { x: 22, y: 54 } },
    ],
  },
  {
    id: 'screen-214',
    gameId: { roomIndex: 268 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'shop',
    randomizerName: 'Cave Shop (Lake Hylia)',
    areaId: 'area-013',
    locationId: 'location-018',
    tags: ['tag-003'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-255', tile: { x: 46, y: 14 } },
      { actorId: 'actor-255', tile: { x: 48, y: 14 } },
      { actorId: 'actor-255', tile: { x: 46, y: 16 } },
      { actorId: 'actor-255', tile: { x: 48, y: 16 } },
      { actorId: 'actor-111', tile: { x: 14, y: 40 } },
      { actorId: 'actor-111', tile: { x: 16, y: 40 } },
      { actorId: 'actor-111', tile: { x: 24, y: 40 } },
      { actorId: 'actor-111', tile: { x: 24, y: 52 } },
    ],
  },
  {
    id: 'screen-213',
    gameId: { roomIndex: 267 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'shop',
    randomizerName: 'Light World Death Mountain Shop',
    areaId: 'area-008',
    locationId: 'location-009',
    tags: ['tag-002'],
    status: 'mapped',
    triggerIds: ['actor-032'],
    spawns: [
      { actorId: 'actor-154', tile: { x: 30, y: 6 } },
      { actorId: 'actor-152', tile: { x: 36, y: 6 } },
      { actorId: 'actor-065', tile: { x: 26, y: 14 } },
    ],
  },
  {
    id: 'screen-220',
    gameId: { roomIndex: 265 },
    kind: 'interior',
    world: 'light',
    interiorKind: 'shop',
    randomizerName: 'Potion Shop',
    areaId: 'area-010',
    locationId: 'location-012',
    tags: ['tag-002'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-260', tile: { x: 20, y: 54 } },
    ],
  },
];

export { LW_SHOPS_SCREENS };
