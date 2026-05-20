import type { RegionDefinition } from '../../../types';

/**
 * Desert Palace — Palace index 4.
 */
export const DESERT_PALACE_DUNGEON: RegionDefinition[] = [
  {
    id: 'desert-palace-main-outer', name: 'Desert Palace Main (Outer)', type: 'dungeon', inGameIndex: 0x84,
    dungeon: 'Desert Palace', displayName: 'Desert Palace', subtitle: 'Entrance',
    gridX: 4, gridY: 8, floor: 0,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:desert', 'dungeon:desert_palace', 'role:entrance'],
  },
  {
    id: 'desert-palace-main-inner', name: 'Desert Palace Main (Inner)', type: 'dungeon', inGameIndex: 0x63,
    dungeon: 'Desert Palace', displayName: 'Desert Palace', subtitle: 'Map Room',
    gridX: 3, gridY: 6, floor: 0,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:desert', 'dungeon:desert_palace', 'role:treasure'],
  },
  {
    id: 'desert-palace-north', name: 'Desert Palace North', type: 'dungeon', inGameIndex: 0x33,
    dungeon: 'Desert Palace', displayName: 'Desert Palace', subtitle: 'Boss',
    gridX: 3, gridY: 3, floor: -1,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:desert', 'dungeon:desert_palace', 'role:boss_room'],
  },
];
