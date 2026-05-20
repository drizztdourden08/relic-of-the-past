import type { RegionDefinition } from '../../../types';

/**
 * Swamp Palace — Palace index 6.
 */
export const SWAMP_PALACE_DUNGEON: RegionDefinition[] = [
  {
    id: 'swamp-palace-entrance', name: 'Swamp Palace Entrance', type: 'dungeon', inGameIndex: 0x28,
    dungeon: 'Swamp Palace', displayName: 'Swamp Palace', subtitle: 'Entrance',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:swamp_palace', 'role:entrance'],
  },
  {
    id: 'swamp-palace-first-room', name: 'Swamp Palace First Room', type: 'dungeon', inGameIndex: 0x38,
    dungeon: 'Swamp Palace', displayName: 'Swamp Palace', subtitle: 'Map Room',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:swamp_palace', 'role:treasure'],
  },
  {
    id: 'swamp-palace-starting-area', name: 'Swamp Palace Starting Area', type: 'dungeon', inGameIndex: 0x37,
    dungeon: 'Swamp Palace', displayName: 'Swamp Palace', subtitle: 'Key Room',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:swamp_palace'],
  },
  {
    id: 'swamp-palace-center', name: 'Swamp Palace Center', type: 'dungeon', inGameIndex: 0x36,
    dungeon: 'Swamp Palace', displayName: 'Swamp Palace', subtitle: 'Big Key',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:swamp_palace', 'role:treasure'],
  },
  {
    id: 'swamp-palace-north', name: 'Swamp Palace North', type: 'dungeon', inGameIndex: 0x16,
    dungeon: 'Swamp Palace', displayName: 'Swamp Palace', subtitle: 'Push Block',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:swamp_palace', 'role:puzzle'],
  },
  {
    id: 'swamp-palace-west', name: 'Swamp Palace West', type: 'dungeon', inGameIndex: 0x34,
    dungeon: 'Swamp Palace', displayName: 'Swamp Palace', subtitle: 'Big Chest',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:swamp_palace', 'role:treasure'],
  },
];
