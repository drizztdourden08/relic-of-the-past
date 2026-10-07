/* @layer shared-game @kind data */

import type { ScreenRecord } from '@shared/game/data/types';

const LW_OVERWORLD_CENTRAL_HYRULE_SCREENS: ScreenRecord[] = [
  {
    id: 'screen-056',
    gameId: { overworldIndex: 42 },
    kind: 'overworld',
    world: 'light',
    name: 'Haunted Grove',
    areaId: 'area-001',
    locationId: 'location-002',
    regionId: 'region-002',
    position: { gridX: 2, gridY: 5 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-064',
    gameId: { overworldIndex: 43 },
    kind: 'overworld',
    world: 'light',
    name: 'Uncle\'s Estate West',
    areaId: 'area-001',
    locationId: 'location-002',
    regionId: 'region-002',
    position: { gridX: 3, gridY: 5 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-072',
    gameId: { overworldIndex: 44 },
    kind: 'overworld',
    world: 'light',
    name: 'Uncle\'s Estate East',
    areaId: 'area-001',
    locationId: 'location-002',
    regionId: 'region-002',
    position: { gridX: 4, gridY: 5 },
    tags: ['tag-001'],
  },
  {
    id: 'screen-026',
    gameId: {},
    kind: 'overworld',
    world: 'light',
    name: 'Light World',
    areaId: 'area-001',
    locationId: 'location-002',
    regionId: 'region-002',
    position: { gridX: 0, gridY: 0 },
    tags: ['tag-001', 'tag-014'],
  },
  {
    id: 'screen-027',
    gameId: {},
    kind: 'overworld',
    world: 'light',
    name: 'Light World (Rain)',
    areaId: 'area-001',
    locationId: 'location-002',
    position: { gridX: 0, gridY: 0 },
    tags: ['tag-001'],
  },
];

export { LW_OVERWORLD_CENTRAL_HYRULE_SCREENS };
