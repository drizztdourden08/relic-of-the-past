import type { RegionDefinition } from '../types';

export const SWAMP_PALACE_DUNGEON: RegionDefinition[] = [
  { id: 'swamp-palace-entrance', name: 'Swamp Palace (Entrance)', type: 'dungeon', dungeon: 'Swamp Palace', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_south', 'dungeon:swamp_palace', 'role:entrance', 'env:water'] },
  { id: 'swamp-palace-first-room', name: 'Swamp Palace (First Room)', type: 'dungeon', dungeon: 'Swamp Palace', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_south', 'dungeon:swamp_palace', 'env:water'] },
  { id: 'swamp-palace-starting-area', name: 'Swamp Palace (Starting Area)', type: 'dungeon', dungeon: 'Swamp Palace', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_south', 'dungeon:swamp_palace', 'env:water'] },
  { id: 'swamp-palace-center', name: 'Swamp Palace (Center)', type: 'dungeon', dungeon: 'Swamp Palace', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_south', 'dungeon:swamp_palace', 'role:hub', 'env:water'] },
  { id: 'swamp-palace-west', name: 'Swamp Palace (West)', type: 'dungeon', dungeon: 'Swamp Palace', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_south', 'dungeon:swamp_palace', 'role:treasure', 'env:water'] },
  { id: 'swamp-palace-north', name: 'Swamp Palace (North)', type: 'dungeon', dungeon: 'Swamp Palace', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_south', 'dungeon:swamp_palace', 'role:boss_room', 'env:water'] },
];
