import type { RegionConnection } from '../../../types';

export const LW_HYRULE_CASTLE_CONNECTIONS: RegionConnection[] = [
  // Entrances from courtyard/overworld
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle', entrance: 'Hyrule Castle Entrance (South)', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle', entrance: 'Hyrule Castle Entrance (East)', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle', entrance: 'Hyrule Castle Entrance (West)', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'menu', to: 'sanctuary', entrance: 'Sanctuary S&Q', tags: ['transit:warp', 'dir:one-way', 'ctx:save-quit'] },
  { from: 'light-world', to: 'sanctuary', entrance: 'Sanctuary', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },

  // Internal dungeon connections
  { from: 'hyrule-castle', to: 'sewer-drop', entrance: 'Throne Room', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'sewer-drop', to: 'sewers-dark', entrance: 'Sewer Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'sewers-dark', to: 'sewers', entrance: 'Sewers Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:dark'] },
  { from: 'sewers', to: 'sanctuary', entrance: 'Sanctuary Push Door', tags: ['transit:push', 'dir:one-way', 'ctx:internal'] },
  { from: 'sewers', to: 'sewers', entrance: 'Sewers Back Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'sewers', to: 'sewers-secret-room', entrance: 'Sewers Secret Room', tags: ['transit:bomb', 'dir:two-way', 'ctx:internal', 'barrier:bomb'] },
];
