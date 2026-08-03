/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../types';

const DW_HOUSES_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-472',
    gameId: { roomIndex: 269 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'house',
    randomizerName: 'Mire Shed',
    areaId: 'area-005',
    locationId: 'location-026',
    tags: ['tag-002', 'tag-024'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-094', tile: { x: 10, y: 44 } },
      { actorId: 'actor-095', tile: { x: 20, y: 44 } },
    ],
  },
  {
    id: 'screen-473',
    gameId: { roomIndex: 275 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'house',
    randomizerName: 'Brewery',
    areaId: 'area-017',
    locationId: 'location-031',
    tags: ['tag-002', 'tag-024'],
    status: 'mapped',
  },
  {
    id: 'screen-471',
    gameId: { roomIndex: 274 },
    kind: 'interior',
    world: 'dark',
    interiorKind: 'house',
    randomizerName: 'C-Shaped House',
    areaId: 'area-017',
    locationId: 'location-031',
    tags: ['tag-002', 'tag-024'],
    status: 'mapped',
    spawns: [
      { actorId: 'actor-165', tile: { x: 14, y: 20 } },
      { actorId: 'actor-230', tile: { x: 46, y: 40 } },
    ],
  },
];

export { DW_HOUSES_SCREENS };
