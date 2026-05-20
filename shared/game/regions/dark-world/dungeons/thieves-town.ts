import type { RegionDefinition } from '../types';

export const THIEVES_TOWN_DUNGEON: RegionDefinition[] = [
  { id: 'thieves-town-entrance', name: 'Thieves Town (Entrance)', type: 'dungeon', dungeon: "Thieves' Town", tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:village_of_outcasts', 'dungeon:thieves_town', 'role:entrance', 'role:hub'] },
  { id: 'thieves-town-deep', name: 'Thieves Town (Deep)', type: 'dungeon', dungeon: "Thieves' Town", tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:village_of_outcasts', 'dungeon:thieves_town', 'role:treasure'] },
  { id: 'blind-fight', name: 'Blind Fight', type: 'dungeon', dungeon: "Thieves' Town", tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:village_of_outcasts', 'dungeon:thieves_town', 'role:boss_room'] },
];
