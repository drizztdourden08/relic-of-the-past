import type { RegionDefinition } from '../../../types';

/**
 * Misery Mire — Palace index 8.
 */
export const MISERY_MIRE_DUNGEON: RegionDefinition[] = [
  {
    id: 'misery-mire-entrance', name: 'Misery Mire Entrance', type: 'dungeon', inGameIndex: 0x98,
    dungeon: 'Misery Mire', displayName: 'Misery Mire', subtitle: 'Entrance',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:entrance'],
  },
  {
    id: 'misery-mire-main', name: 'Misery Mire Main', type: 'dungeon', inGameIndex: 0xB3,
    dungeon: 'Misery Mire', displayName: 'Misery Mire', subtitle: 'Hub',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:hub'],
  },
  {
    id: 'misery-mire-west', name: 'Misery Mire West', type: 'dungeon', inGameIndex: 0xC1,
    dungeon: 'Misery Mire', displayName: 'Misery Mire', subtitle: 'Big Key',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:treasure'],
  },
  {
    id: 'misery-mire-final-area', name: 'Misery Mire Final Area', type: 'dungeon', inGameIndex: 0xD1,
    dungeon: 'Misery Mire', displayName: 'Misery Mire', subtitle: 'Dark Cane',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:dark_room'],
  },
  {
    id: 'misery-mire-vitreous', name: 'Misery Mire Boss (Vitreous)', type: 'dungeon', inGameIndex: 0xA0,
    dungeon: 'Misery Mire', displayName: 'Misery Mire', subtitle: 'Boss',
    tags: ['world:dark', 'env:inside', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:boss_room'],
  },
];
