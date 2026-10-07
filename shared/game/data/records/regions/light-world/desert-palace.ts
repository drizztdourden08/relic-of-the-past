/* @layer shared-game @kind data */

import type { RegionRecord } from '@shared/game/data/types';

const LW_DESERT_PALACE_REGIONS: RegionRecord[] = [
  {
    id: 'region-164',
    world: 'light',
    type: 'dungeon',
    name: 'Desert Palace Main (Outer)',
    dungeonId: 'dungeon-004',
  },
  {
    id: 'region-165',
    world: 'light',
    type: 'dungeon',
    name: 'Desert Palace Main (Inner)',
    dungeonId: 'dungeon-004',
    bunnyImpassable: true,
  },
  {
    id: 'region-166',
    world: 'light',
    type: 'dungeon',
    name: 'Desert Palace East',
    dungeonId: 'dungeon-004',
  },
  {
    id: 'region-167',
    world: 'light',
    type: 'dungeon',
    name: 'Desert Palace North',
    dungeonId: 'dungeon-004',
  },
];

export { LW_DESERT_PALACE_REGIONS };
