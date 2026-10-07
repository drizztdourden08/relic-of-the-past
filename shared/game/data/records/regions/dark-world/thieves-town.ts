/* @layer shared-game @kind data */

import type { RegionRecord } from '@shared/game/data/types';

const DW_THIEVES_TOWN_REGIONS: RegionRecord[] = [
  {
    id: 'region-186',
    world: 'dark',
    type: 'dungeon',
    name: 'Thieves Town (Entrance)',
    dungeonId: 'dungeon-009',
  },
  {
    id: 'region-187',
    world: 'dark',
    type: 'dungeon',
    name: 'Thieves Town (Deep)',
    dungeonId: 'dungeon-009',
  },
  {
    id: 'region-188',
    world: 'dark',
    type: 'dungeon',
    name: 'Blind Fight',
    dungeonId: 'dungeon-009',
  },
];

export { DW_THIEVES_TOWN_REGIONS };
