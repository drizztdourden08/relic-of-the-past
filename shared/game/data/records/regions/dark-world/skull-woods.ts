/* @layer shared-game @kind data */

import type { RegionRecord } from '@shared/game/data/types';

const DW_SKULL_WOODS_REGIONS: RegionRecord[] = [
  {
    id: 'region-189',
    world: 'dark',
    type: 'dungeon',
    name: 'Skull Woods First Section',
    dungeonId: 'dungeon-008',
  },
  {
    id: 'region-190',
    world: 'dark',
    type: 'dungeon',
    name: 'Skull Woods First Section (Right)',
    dungeonId: 'dungeon-008',
    bunnyImpassable: true,
  },
  {
    id: 'region-191',
    world: 'dark',
    type: 'dungeon',
    name: 'Skull Woods First Section (Left)',
    dungeonId: 'dungeon-008',
    bunnyImpassable: true,
  },
  {
    id: 'region-192',
    world: 'dark',
    type: 'dungeon',
    name: 'Skull Woods First Section (Top)',
    dungeonId: 'dungeon-008',
    bunnyImpassable: true,
  },
  {
    id: 'region-193',
    world: 'dark',
    type: 'dungeon',
    name: 'Skull Woods Second Section (Drop)',
    dungeonId: 'dungeon-008',
    bunnyImpassable: true,
  },
  {
    id: 'region-194',
    world: 'dark',
    type: 'dungeon',
    name: 'Skull Woods Second Section',
    dungeonId: 'dungeon-008',
  },
  {
    id: 'region-195',
    world: 'dark',
    type: 'dungeon',
    name: 'Skull Woods Final Section (Entrance)',
    dungeonId: 'dungeon-008',
  },
  {
    id: 'region-196',
    world: 'dark',
    type: 'dungeon',
    name: 'Skull Woods Final Section (Mothula)',
    dungeonId: 'dungeon-008',
  },
];

export { DW_SKULL_WOODS_REGIONS };
