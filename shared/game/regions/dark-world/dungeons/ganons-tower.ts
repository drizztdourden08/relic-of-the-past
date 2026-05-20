import type { RegionDefinition } from '../../../types';

/**
 * Ganon's Tower — Palace index 14.
 */
export const GANONS_TOWER_DUNGEON: RegionDefinition[] = [
  {
    id: 'ganons-tower-entrance', name: "GT Entrance", type: 'dungeon', inGameIndex: 0x0C,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Entrance',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower', 'role:entrance'],
  },
  {
    id: 'ganons-tower-bottom', name: 'GT Bottom', type: 'dungeon', inGameIndex: 0x0D,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Torches',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower'],
  },
  {
    id: 'ganons-tower-tile-room', name: 'GT Tile Room', type: 'dungeon', inGameIndex: 0x3C,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Tile Room',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower'],
  },
  {
    id: 'ganons-tower-compass-room', name: 'GT Compass Room', type: 'dungeon', inGameIndex: 0x3D,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Compass',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower', 'role:treasure'],
  },
  {
    id: 'ganons-tower-hookshot-room', name: 'GT Hookshot Room', type: 'dungeon', inGameIndex: 0x4C,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Hookshot',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower'],
  },
  {
    id: 'ganons-tower-map-room', name: 'GT Map Room', type: 'dungeon', inGameIndex: 0x5C,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Map',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower', 'role:treasure'],
  },
  {
    id: 'ganons-tower-firesnake-room', name: 'GT Firesnake Room', type: 'dungeon', inGameIndex: 0x5D,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Firesnake',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower'],
  },
  {
    id: 'ganons-tower-teleport-room', name: 'GT Teleport Room', type: 'dungeon', inGameIndex: 0x6C,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Randomizer',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower'],
  },
  {
    id: 'ganons-tower-top', name: 'GT Top (Big Chest)', type: 'dungeon', inGameIndex: 0x7C,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Big Chest',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower', 'role:treasure'],
  },
  {
    id: 'ganons-tower-before-moldorm', name: 'GT Pre-Moldorm', type: 'dungeon', inGameIndex: 0x8C,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Pre-Moldorm',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower'],
  },
  {
    id: 'ganons-tower-moldorm', name: 'GT Moldorm', type: 'dungeon', inGameIndex: 0x9C,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Moldorm',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower', 'role:boss_room'],
  },
  {
    id: 'agahnim-2', name: 'Agahnim 2', type: 'dungeon', inGameIndex: 0xE0,
    dungeon: "Ganon's Tower", displayName: "Ganon's Tower", subtitle: 'Boss',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_death_mountain', 'dungeon:ganons_tower', 'role:boss_room'],
  },
];
