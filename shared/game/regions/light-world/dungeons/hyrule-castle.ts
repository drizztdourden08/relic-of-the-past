import type { RegionDefinition } from '../../../types';

/**
 * Hyrule Castle, Sewers & Sanctuary — Palace indices 0, 1, 2.
 * IDs match connection references.
 */
export const HYRULE_CASTLE_DUNGEON: RegionDefinition[] = [
  {
    id: 'sanctuary', name: 'Sanctuary', type: 'dungeon', inGameIndex: 0x12,
    dungeon: 'Hyrule Castle', displayName: 'Sanctuary',
    gridX: 2, gridY: 1, floor: 0,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:safe_zone', 'role:spawn_point'],
  },
  {
    id: 'sewer-drop', name: 'Sewer Drop', type: 'dungeon', inGameIndex: 0x50,
    dungeon: 'Hyrule Castle', displayName: 'Hyrule Castle', subtitle: 'Sewers',
    gridX: 0, gridY: 5, floor: -1,
    tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:drop_zone'],
  },
  {
    id: 'sewers-dark', name: 'Sewers (Dark)', type: 'dungeon', inGameIndex: 0x41,
    dungeon: 'Hyrule Castle', displayName: 'Hyrule Castle', subtitle: 'Sewers Dark',
    gridX: 1, gridY: 4, floor: -1,
    tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:dark_room'],
  },
  {
    id: 'sewers', name: 'Sewers', type: 'dungeon', inGameIndex: 0x51,
    dungeon: 'Hyrule Castle', displayName: 'Hyrule Castle', subtitle: 'Sewers',
    gridX: 1, gridY: 5, floor: -1,
    tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle'],
  },
  {
    id: 'sewers-secret-room', name: 'Sewers Secret Room', type: 'dungeon', inGameIndex: 0x52,
    dungeon: 'Hyrule Castle', displayName: 'Hyrule Castle', subtitle: 'Sewers Secret',
    gridX: 2, gridY: 5, floor: -1,
    tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:treasure'],
  },
  {
    id: 'hyrule-castle', name: 'Hyrule Castle', type: 'dungeon', inGameIndex: 0x61,
    dungeon: 'Hyrule Castle', displayName: 'Hyrule Castle', subtitle: 'Main Hall',
    gridX: 1, gridY: 6, floor: 1,
    tags: ['world:light', 'env:inside', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:entrance', 'role:hub'],
  },
  {
    id: 'hyrule-castle-secret-entrance', name: 'HC Secret Entrance', type: 'dungeon', inGameIndex: 0x55,
    dungeon: 'Hyrule Castle', displayName: 'Hyrule Castle', subtitle: 'Secret Entrance',
    gridX: 5, gridY: 5, floor: -1,
    tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:connector'],
  },
];
