import type { RegionDefinition } from '../../../types';

/**
 * Palace of Darkness — Palace index 7.
 */
export const PALACE_OF_DARKNESS_DUNGEON: RegionDefinition[] = [
  {
    id: 'palace-of-darkness-entrance', name: 'PoD Entrance', type: 'dungeon', inGameIndex: 0x4A,
    dungeon: 'Palace of Darkness', displayName: 'Palace of Darkness', subtitle: 'Entrance',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:entrance'],
  },
  {
    id: 'palace-of-darkness-center', name: 'PoD Center', type: 'dungeon', inGameIndex: 0x0A,
    dungeon: 'Palace of Darkness', displayName: 'Palace of Darkness', subtitle: 'Center',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:hub'],
  },
  {
    id: 'palace-of-darkness-maze', name: 'PoD Dark Maze', type: 'dungeon', inGameIndex: 0x19,
    dungeon: 'Palace of Darkness', displayName: 'Palace of Darkness', subtitle: 'Dark Maze',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:dark_room'],
  },
  {
    id: 'palace-of-darkness-big-key-chest', name: 'PoD Big Key Chest', type: 'dungeon', inGameIndex: 0x3A,
    dungeon: 'Palace of Darkness', displayName: 'Palace of Darkness', subtitle: 'Big Key',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:treasure'],
  },
  {
    id: 'palace-of-darkness-harmless-hellway', name: 'PoD Harmless Hellway', type: 'dungeon', inGameIndex: 0x2B,
    dungeon: 'Palace of Darkness', displayName: 'Palace of Darkness', subtitle: 'Hellway',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness'],
  },
  {
    id: 'palace-of-darkness-bonk-section', name: 'PoD Bonk Section', type: 'dungeon', inGameIndex: 0x1A,
    dungeon: 'Palace of Darkness', displayName: 'Palace of Darkness', subtitle: 'Big Chest',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:treasure'],
  },
  {
    id: 'palace-of-darkness-north', name: 'PoD North', type: 'dungeon', inGameIndex: 0x09,
    dungeon: 'Palace of Darkness', displayName: 'Palace of Darkness', subtitle: 'Shooter Room',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness'],
  },
  {
    id: 'palace-of-darkness-final-section', name: 'PoD Final Section', type: 'dungeon', inGameIndex: 0x5A,
    dungeon: 'Palace of Darkness', displayName: 'Palace of Darkness', subtitle: 'Boss',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:boss_room'],
  },
];
