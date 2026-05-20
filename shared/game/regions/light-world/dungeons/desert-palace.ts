import type { RegionDefinition } from '../types';

export const DESERT_PALACE_DUNGEON: RegionDefinition[] = [
  { id: 'desert-palace-main-outer', name: 'Desert Palace Main (Outer)', type: 'dungeon', dungeon: 'Desert Palace', tags: ['world:light', 'env:inside', 'type:dungeon', 'area:desert', 'dungeon:desert_palace', 'role:entrance', 'role:hub'] },
  { id: 'desert-palace-main-inner', name: 'Desert Palace Main (Inner)', type: 'dungeon', dungeon: 'Desert Palace', tags: ['world:light', 'env:inside', 'type:dungeon', 'area:desert', 'dungeon:desert_palace', 'role:puzzle'] },
  { id: 'desert-palace-east', name: 'Desert Palace East', type: 'dungeon', dungeon: 'Desert Palace', tags: ['world:light', 'env:inside', 'type:dungeon', 'area:desert', 'dungeon:desert_palace', 'role:treasure'] },
  { id: 'desert-palace-north', name: 'Desert Palace North', type: 'dungeon', dungeon: 'Desert Palace', tags: ['world:light', 'env:inside', 'type:dungeon', 'area:desert', 'dungeon:desert_palace', 'role:boss_room'] },
];
