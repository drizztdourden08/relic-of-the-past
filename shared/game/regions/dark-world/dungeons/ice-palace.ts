import type { RegionDefinition } from '../../../types';

/**
 * Ice Palace — Palace index 10.
 */
export const ICE_PALACE_DUNGEON: RegionDefinition[] = [
  {
    id: 'ice-palace-entrance', name: 'Ice Palace Entrance', type: 'dungeon', inGameIndex: 0x0E,
    dungeon: 'Ice Palace', displayName: 'Ice Palace', subtitle: 'Entrance',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_lake_hylia', 'dungeon:ice_palace', 'role:entrance'],
  },
  {
    id: 'ice-palace-main', name: 'Ice Palace Main', type: 'dungeon', inGameIndex: 0x1E,
    dungeon: 'Ice Palace', displayName: 'Ice Palace', subtitle: 'Compass',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_lake_hylia', 'dungeon:ice_palace'],
  },
  {
    id: 'ice-palace-east', name: 'Ice Palace East', type: 'dungeon', inGameIndex: 0x3F,
    dungeon: 'Ice Palace', displayName: 'Ice Palace', subtitle: 'Map',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_lake_hylia', 'dungeon:ice_palace', 'role:treasure'],
  },
  {
    id: 'ice-palace-east-top', name: 'Ice Palace East Top', type: 'dungeon', inGameIndex: 0x2E,
    dungeon: 'Ice Palace', displayName: 'Ice Palace', subtitle: 'Stalfos',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_lake_hylia', 'dungeon:ice_palace'],
  },
  {
    id: 'ice-palace-second-section', name: 'Ice Palace Second Section', type: 'dungeon', inGameIndex: 0x4E,
    dungeon: 'Ice Palace', displayName: 'Ice Palace', subtitle: 'Bomb Floor',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_lake_hylia', 'dungeon:ice_palace', 'role:puzzle'],
  },
  {
    id: 'ice-palace-kholdstare', name: 'Ice Palace Boss (Kholdstare)', type: 'dungeon', inGameIndex: 0xDE,
    dungeon: 'Ice Palace', displayName: 'Ice Palace', subtitle: 'Boss',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_lake_hylia', 'dungeon:ice_palace', 'role:boss_room'],
  },
];
