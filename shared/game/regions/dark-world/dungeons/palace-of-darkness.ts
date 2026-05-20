import type { RegionDefinition } from '../types';

export const PALACE_OF_DARKNESS_DUNGEON: RegionDefinition[] = [
  { id: 'palace-of-darkness-entrance', name: 'Palace of Darkness (Entrance)', type: 'dungeon', dungeon: 'Palace of Darkness', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:entrance', 'role:hub'] },
  { id: 'palace-of-darkness-center', name: 'Palace of Darkness (Center)', type: 'dungeon', dungeon: 'Palace of Darkness', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:hub'] },
  { id: 'palace-of-darkness-big-key-chest', name: 'Palace of Darkness (Big Key Chest)', type: 'dungeon', dungeon: 'Palace of Darkness', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:treasure'] },
  { id: 'palace-of-darkness-bonk-section', name: 'Palace of Darkness (Bonk Section)', type: 'dungeon', dungeon: 'Palace of Darkness', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:puzzle'] },
  { id: 'palace-of-darkness-north', name: 'Palace of Darkness (North)', type: 'dungeon', dungeon: 'Palace of Darkness', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:connector'] },
  { id: 'palace-of-darkness-maze', name: 'Palace of Darkness (Maze)', type: 'dungeon', dungeon: 'Palace of Darkness', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:puzzle', 'role:dark_room'] },
  { id: 'palace-of-darkness-harmless-hellway', name: 'Palace of Darkness (Harmless Hellway)', type: 'dungeon', dungeon: 'Palace of Darkness', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:connector'] },
  { id: 'palace-of-darkness-final-section', name: 'Palace of Darkness (Final Section)', type: 'dungeon', dungeon: 'Palace of Darkness', tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_east', 'dungeon:palace_of_darkness', 'role:boss_room'] },
];
