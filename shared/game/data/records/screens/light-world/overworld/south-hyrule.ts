/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_OVERWORLD_SOUTH_HYRULE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-057',
    gameId: { overworldIndex: 50 },
    kind: 'overworld',
    world: 'light',
    name: 'Haunted Terrace',
    areaId: 'area-016',
    locationId: 'location-025',
    regionId: 'region-002',
    position: { gridX: 2, gridY: 6 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-003',
    gameId: {},
    kind: 'overworld',
    world: 'light',
    name: 'Cave 45 Ledge',
    areaId: 'area-016',
    locationId: 'location-025',
    regionId: 'region-009',
    position: { gridX: 0, gridY: 0 },
    tags: ['tag-001'],
  },
];

export { LW_OVERWORLD_SOUTH_HYRULE_SCREENS };
