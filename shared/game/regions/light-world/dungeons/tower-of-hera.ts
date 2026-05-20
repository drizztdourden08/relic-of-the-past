import type { RegionDefinition } from '../types';

export const TOWER_OF_HERA_DUNGEON: RegionDefinition[] = [
  { id: 'tower-of-hera-bottom', name: 'Tower of Hera (Bottom)', type: 'dungeon', dungeon: 'Tower of Hera', tags: ['world:light', 'env:inside', 'type:dungeon', 'area:death_mountain', 'dungeon:tower_of_hera', 'role:entrance', 'role:hub'] },
  { id: 'tower-of-hera-basement', name: 'Tower of Hera (Basement)', type: 'dungeon', dungeon: 'Tower of Hera', tags: ['world:light', 'env:underground', 'type:dungeon', 'area:death_mountain', 'dungeon:tower_of_hera', 'role:treasure'] },
  { id: 'tower-of-hera-top', name: 'Tower of Hera (Top)', type: 'dungeon', dungeon: 'Tower of Hera', tags: ['world:light', 'env:inside', 'type:dungeon', 'area:death_mountain', 'dungeon:tower_of_hera', 'role:boss_room'] },
];
