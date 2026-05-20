import type { RegionConnection } from '../../../types';

export const DW_THIEVES_TOWN_CONNECTIONS: RegionConnection[] = [
  { from: 'overworld', to: 'tt-0xdc', entrance: 'Town Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'tt-0x44', to: 'tt-0x45', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0x44', to: 'tt-0x64', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0x45', to: 'tt-0x65', entrance: 'Boss Door', tags: ['transit:walk', 'dir:two-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'tt-0x64', to: 'tt-0x65', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xab', to: 'tt-0xac', entrance: 'Attic Access', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xab', to: 'tt-0xbb', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xac', to: 'tt-0xbc', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xbb', to: 'tt-0xcb', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xbb', to: 'tt-0xbc', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xbc', to: 'tt-0xcc', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xcb', to: 'tt-0xdb', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xcb', to: 'tt-0xcc', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xcc', to: 'tt-0xdc', entrance: 'South to Entrance', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xdb', to: 'tt-0xdc', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xdc', to: 'tt-0x44', entrance: 'B1 Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'tt-0xdc', to: 'dw-58', entrance: 'Town Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
