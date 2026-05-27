import type { RegionConnection } from '../../../types';

export const LW_DESERT_PALACE_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-30', to: 'dp-0x84', entrance: 'Main Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'lw-30', to: 'dp-0x83', entrance: 'West Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'lw-30', to: 'dp-0x85', entrance: 'East Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'dp-0x33', to: 'dp-0x43', entrance: 'Boss Door', tags: ['transit:walk', 'dir:two-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'dp-0x43', to: 'dp-0x53', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x53', to: 'dp-0x63', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'dp-0x63', to: 'dp-0x73', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x73', to: 'dp-0x74', entrance: 'Basement Stairs West', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x73', to: 'dp-0x83', entrance: 'South to West Entry', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x74', to: 'dp-0x84', entrance: 'Basement Stairs Mid', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x74', to: 'dp-0x75', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x75', to: 'dp-0x85', entrance: 'Basement Stairs East', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x83', to: 'dp-0x84', entrance: 'East to Main', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x84', to: 'dp-0x85', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x53', to: 'dp-0x63', entrance: 'Key Door', tags: ['transit:walk', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'dp-0x84', to: 'lw-30', entrance: 'Main Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'dp-0x63', to: 'dp-0x73', entrance: 'Torch Hall', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x83', to: 'lw-30', entrance: 'West Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'dp-0x85', to: 'lw-30', entrance: 'East Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
