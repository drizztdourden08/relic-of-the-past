/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../../types';

const LW_OVERWORLD_LOST_WOODS_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-028',
    gameId: { overworldIndex: 0 },
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Lost Woods NW',
    areaId: 'area-014',
    locationId: 'location-019',
    position: { gridX: 0, gridY: 0 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-043',
    gameId: { overworldIndex: 1 },
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Lost Woods NE',
    areaId: 'area-014',
    locationId: 'location-019',
    position: { gridX: 1, gridY: 0 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-029',
    gameId: { overworldIndex: 8 },
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Lost Woods SW',
    areaId: 'area-014',
    locationId: 'location-019',
    position: { gridX: 0, gridY: 1 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-044',
    gameId: { overworldIndex: 9 },
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Lost Woods SE',
    areaId: 'area-014',
    locationId: 'location-019',
    position: { gridX: 1, gridY: 1 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-030',
    gameId: { overworldIndex: 16 },
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Lost Woods Outskirts',
    areaId: 'area-014',
    locationId: 'location-019',
    position: { gridX: 0, gridY: 2 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-036',
    gameId: {},
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Pedestal Meadow',
    areaId: 'area-014',
    locationId: 'location-019',
    position: { gridX: 0, gridY: 0 },
    tags: ['tag-001', 'tag-024'],
  },
];

export { LW_OVERWORLD_LOST_WOODS_SCREENS };
