import type { RegionDefinition } from '../../../types';

/**
 * Castle Tower (Agahnim's Tower) — Palace index 5.
 */
export const CASTLE_TOWER_DUNGEON: RegionDefinition[] = [
  {
    id: 'agahnims-tower', name: "Agahnim's Tower", type: 'dungeon', inGameIndex: 0xB0,
    dungeon: 'Castle Tower', displayName: 'Castle Tower', subtitle: 'Entrance',
    gridX: 0, gridY: 11, floor: 0,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:hyrule_castle', 'dungeon:castle_tower', 'role:entrance'],
  },
  {
    id: 'agahnim-1', name: "Agahnim's Chamber", type: 'dungeon', inGameIndex: 0xE0,
    dungeon: 'Castle Tower', displayName: 'Castle Tower', subtitle: 'Boss',
    gridX: 0, gridY: 14, floor: 3,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:hyrule_castle', 'dungeon:castle_tower', 'role:boss_room'],
  },
];
