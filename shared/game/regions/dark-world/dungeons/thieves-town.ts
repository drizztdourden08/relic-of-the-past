import type { RegionDefinition } from '../../../types';

/**
 * Thieves' Town — Palace index 12.
 */
export const THIEVES_TOWN_DUNGEON: RegionDefinition[] = [
  {
    id: 'thieves-town-entrance', name: "Thieves' Town Entrance", type: 'dungeon', inGameIndex: 0xDB,
    dungeon: "Thieves' Town", displayName: "Thieves' Town", subtitle: 'Entrance',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:village_of_outcasts', 'dungeon:thieves_town', 'role:entrance'],
  },
  {
    id: 'thieves-town-deep', name: "Thieves' Town Deep", type: 'dungeon', inGameIndex: 0xAC,
    dungeon: "Thieves' Town", displayName: "Thieves' Town", subtitle: 'Deep Section',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:village_of_outcasts', 'dungeon:thieves_town'],
  },
  {
    id: 'blind-fight', name: 'Blind Fight', type: 'dungeon', inGameIndex: 0x2C,
    dungeon: "Thieves' Town", displayName: "Thieves' Town", subtitle: 'Boss',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:village_of_outcasts', 'dungeon:thieves_town', 'role:boss_room'],
  },
];
