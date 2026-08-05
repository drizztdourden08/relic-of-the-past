/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ScreenRecord } from '../../../types';

const LW_OVERWORLD_SOUTH_HYRULE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-057',
    gameId: { overworldIndex: 50 },
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Haunted Terrace',
    areaId: 'area-016',
    locationId: 'location-002',
    position: { gridX: 2, gridY: 6 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-003',
    gameId: {},
    kind: 'overworld',
    world: 'light',
    randomizerName: 'Cave 45 Ledge',
    areaId: 'area-016',
    locationId: 'location-002',
    position: { gridX: 0, gridY: 0 },
    tags: ['tag-001'],
  },
];

export { LW_OVERWORLD_SOUTH_HYRULE_SCREENS };
