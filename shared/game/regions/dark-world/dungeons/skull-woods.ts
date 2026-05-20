import type { RegionDefinition } from '../types';

export const SKULL_WOODS_DUNGEON: RegionDefinition[] = [
  { id: 'skull-woods-first-section', name: 'Skull Woods First Section', type: 'dungeon', dungeon: 'Skull Woods', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:entrance', 'role:hub'] },
  { id: 'skull-woods-first-section-right', name: 'Skull Woods First Section (Right)', type: 'dungeon', dungeon: 'Skull Woods', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:treasure'] },
  { id: 'skull-woods-first-section-left', name: 'Skull Woods First Section (Left)', type: 'dungeon', dungeon: 'Skull Woods', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:connector'] },
  { id: 'skull-woods-first-section-top', name: 'Skull Woods First Section (Top)', type: 'dungeon', dungeon: 'Skull Woods', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:treasure'] },
  { id: 'skull-woods-second-section-drop', name: 'Skull Woods Second Section (Drop)', type: 'dungeon', dungeon: 'Skull Woods', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:drop_zone'] },
  { id: 'skull-woods-second-section', name: 'Skull Woods Second Section', type: 'dungeon', dungeon: 'Skull Woods', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:treasure'] },
  { id: 'skull-woods-final-section-entrance', name: 'Skull Woods Final Section (Entrance)', type: 'dungeon', dungeon: 'Skull Woods', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:entrance'] },
  { id: 'skull-woods-final-section-mothula', name: 'Skull Woods Final Section (Mothula)', type: 'dungeon', dungeon: 'Skull Woods', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:boss_room'] },
];
