import type { RegionDefinition } from '../types';

export const HYRULE_CASTLE_DUNGEON: RegionDefinition[] = [
  { id: 'hyrule-castle', name: 'Hyrule Castle', type: 'dungeon', dungeon: 'Hyrule Castle', tags: ['world:light', 'env:inside', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:entrance', 'role:hub'] },
  { id: 'sewer-drop', name: 'Sewer Drop', type: 'dungeon', dungeon: 'Hyrule Castle', tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:drop_zone'] },
  { id: 'sewers-dark', name: 'Sewers (Dark)', type: 'dungeon', dungeon: 'Hyrule Castle', tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:dark_room'] },
  { id: 'sewers', name: 'Sewers', type: 'dungeon', dungeon: 'Hyrule Castle', tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:connector'] },
  { id: 'sewers-secret-room', name: 'Sewers Secret Room', type: 'dungeon', dungeon: 'Hyrule Castle', tags: ['world:light', 'env:underground', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:treasure'] },
  { id: 'sanctuary', name: 'Sanctuary', type: 'dungeon', dungeon: 'Hyrule Castle', tags: ['world:light', 'env:inside', 'type:dungeon', 'area:hyrule_castle', 'dungeon:hyrule_castle', 'role:safe_zone', 'role:spawn_point'] },
];
