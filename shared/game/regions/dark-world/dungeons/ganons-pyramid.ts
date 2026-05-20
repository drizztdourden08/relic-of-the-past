import type { RegionDefinition } from '../../../types';

/**
 * Ganon's Pyramid — The final battle area.
 */
export const GANONS_PYRAMID_DUNGEON: RegionDefinition[] = [
  {
    id: 'bottom-of-pyramid', name: "Bottom of Pyramid", type: 'dungeon', inGameIndex: 0x00,
    dungeon: "Ganon's Tower", displayName: "Ganon's Pyramid", subtitle: 'Ganon',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_north', 'dungeon:ganons_tower', 'role:boss_room'],
  },
];
