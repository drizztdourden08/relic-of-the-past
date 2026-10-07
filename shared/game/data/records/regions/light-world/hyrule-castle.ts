/* @layer shared-game @kind data */

import type { RegionRecord } from '@shared/game/data/types';

const LW_HYRULE_CASTLE_REGIONS: RegionRecord[] = [
  {
    id: 'region-169',
    world: 'light',
    type: 'dungeon',
    name: 'Hyrule Castle',
    dungeonId: 'dungeon-001',
  },
  {
    id: 'region-170',
    world: 'light',
    type: 'dungeon',
    name: 'Sewer Drop',
    dungeonId: 'dungeon-001',
  },
  {
    id: 'region-171',
    world: 'light',
    type: 'dungeon',
    name: 'Sewers (Dark)',
    dungeonId: 'dungeon-001',
  },
  {
    id: 'region-172',
    world: 'light',
    type: 'dungeon',
    name: 'Sewers',
    dungeonId: 'dungeon-001',
    bunnyImpassable: true,
  },
  {
    id: 'region-173',
    world: 'light',
    type: 'dungeon',
    name: 'Sewers Secret Room',
    dungeonId: 'dungeon-001',
  },
  {
    id: 'region-174',
    world: 'light',
    type: 'dungeon',
    name: 'Sanctuary',
    dungeonId: 'dungeon-001',
  },
];

export { LW_HYRULE_CASTLE_REGIONS };
