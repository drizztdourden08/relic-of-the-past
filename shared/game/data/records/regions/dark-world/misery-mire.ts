/* @layer shared-game @kind data */

import type { RegionRecord } from '@shared/game/data/types';

const DW_MISERY_MIRE_REGIONS: RegionRecord[] = [
  {
    id: 'region-203',
    world: 'dark',
    type: 'dungeon',
    name: 'Misery Mire (Entrance)',
    dungeonId: 'dungeon-011',
  },
  {
    id: 'region-204',
    world: 'dark',
    type: 'dungeon',
    name: 'Misery Mire (Main)',
    dungeonId: 'dungeon-011',
  },
  {
    id: 'region-205',
    world: 'dark',
    type: 'dungeon',
    name: 'Misery Mire (West)',
    dungeonId: 'dungeon-011',
  },
  {
    id: 'region-206',
    world: 'dark',
    type: 'dungeon',
    name: 'Misery Mire (Final Area)',
    dungeonId: 'dungeon-011',
  },
  {
    id: 'region-207',
    world: 'dark',
    type: 'dungeon',
    name: 'Misery Mire (Vitreous)',
    dungeonId: 'dungeon-011',
  },
];

export { DW_MISERY_MIRE_REGIONS };
