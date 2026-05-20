import type { RegionDefinition } from '../../../types';

/**
 * Skull Woods — Palace index 9.
 */
export const SKULL_WOODS_DUNGEON: RegionDefinition[] = [
  {
    id: 'skull-woods-first-section', name: 'Skull Woods First Section', type: 'dungeon', inGameIndex: 0x58,
    dungeon: 'Skull Woods', displayName: 'Skull Woods', subtitle: 'Section 1',
    tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:entrance'],
  },
  {
    id: 'skull-woods-first-section-right', name: 'Skull Woods First Section (Right)', type: 'dungeon', inGameIndex: 0x59,
    dungeon: 'Skull Woods', displayName: 'Skull Woods', subtitle: 'Compass',
    tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:treasure'],
  },
  {
    id: 'skull-woods-first-section-left', name: 'Skull Woods First Section (Left)', type: 'dungeon', inGameIndex: 0x57,
    dungeon: 'Skull Woods', displayName: 'Skull Woods', subtitle: 'Left',
    tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods'],
  },
  {
    id: 'skull-woods-first-section-top', name: 'Skull Woods First Section (Top)', type: 'dungeon', inGameIndex: 0x56,
    dungeon: 'Skull Woods', displayName: 'Skull Woods', subtitle: 'Big Chest',
    tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:treasure'],
  },
  {
    id: 'skull-woods-second-section', name: 'Skull Woods Second Section', type: 'dungeon', inGameIndex: 0x68,
    dungeon: 'Skull Woods', displayName: 'Skull Woods', subtitle: 'Section 2',
    tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods'],
  },
  {
    id: 'skull-woods-second-section-drop', name: 'Skull Woods Second Section (Drop)', type: 'dungeon', inGameIndex: 0x69,
    dungeon: 'Skull Woods', displayName: 'Skull Woods', subtitle: 'Pot Prison',
    tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:drop_zone'],
  },
  {
    id: 'skull-woods-final-section-entrance', name: 'Skull Woods Final Section', type: 'dungeon', inGameIndex: 0x39,
    dungeon: 'Skull Woods', displayName: 'Skull Woods', subtitle: 'Final Section',
    tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods'],
  },
  {
    id: 'skull-woods-final-section-mothula', name: 'Skull Woods Boss (Mothula)', type: 'dungeon', inGameIndex: 0x49,
    dungeon: 'Skull Woods', displayName: 'Skull Woods', subtitle: 'Boss',
    tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:skull_woods_area', 'dungeon:skull_woods', 'role:boss_room'],
  },
];
