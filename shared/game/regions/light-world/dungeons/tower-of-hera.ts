import type { RegionDefinition } from '../../../types';

/**
 * Tower of Hera — Palace index 13.
 */
export const TOWER_OF_HERA_DUNGEON: RegionDefinition[] = [
  {
    id: 'tower-of-hera-bottom', name: 'Tower of Hera (Bottom)', type: 'dungeon', inGameIndex: 0x77,
    dungeon: 'Tower of Hera', displayName: 'Tower of Hera', subtitle: 'Entrance',
    gridX: 7, gridY: 7, floor: 0,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:death_mountain', 'dungeon:tower_of_hera', 'role:entrance'],
  },
  {
    id: 'tower-of-hera-basement', name: 'Tower of Hera (Basement)', type: 'dungeon', inGameIndex: 0x31,
    dungeon: 'Tower of Hera', displayName: 'Tower of Hera', subtitle: 'Basement',
    gridX: 1, gridY: 3, floor: -1,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:death_mountain', 'dungeon:tower_of_hera', 'role:treasure'],
  },
  {
    id: 'tower-of-hera-top', name: 'Tower of Hera (Top)', type: 'dungeon', inGameIndex: 0x07,
    dungeon: 'Tower of Hera', displayName: 'Tower of Hera', subtitle: 'Boss',
    gridX: 7, gridY: 0, floor: 5,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:death_mountain', 'dungeon:tower_of_hera', 'role:boss_room'],
  },
];
