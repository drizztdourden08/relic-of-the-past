import type { RegionDefinition } from '../../../types';

/**
 * Eastern Palace — Palace index 3.
 */
export const EASTERN_PALACE_DUNGEON: RegionDefinition[] = [
  {
    id: 'eastern-palace', name: 'Eastern Palace', type: 'dungeon', inGameIndex: 0xC9,
    dungeon: 'Eastern Palace', displayName: 'Eastern Palace', subtitle: 'Entrance',
    gridX: 9, gridY: 12, floor: 0,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:east_hyrule', 'dungeon:eastern_palace', 'role:entrance', 'role:hub'],
  },
];
