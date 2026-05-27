import type { RegionConnection } from '../../../types';

export const DW_SWAMP_PALACE_CONNECTIONS: RegionConnection[] = [
  { from: 'dw-3b', to: 'sp-0x28', entrance: 'Palace Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'sp-0x06', to: 'sp-0x16', entrance: 'Boss Return', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x16', to: 'sp-0x26', entrance: 'Big Key Door', tags: ['transit:walk', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'sp-0x25', to: 'sp-0x35', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x26', to: 'sp-0x25', entrance: 'West Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x26', to: 'sp-0x36', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x28', to: 'sp-0x38', entrance: 'Basement Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x34', to: 'sp-0x35', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x34', to: 'sp-0x54', entrance: 'Flooded Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x35', to: 'sp-0x36', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x36', to: 'sp-0x37', entrance: 'East to Map Room', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x36', to: 'sp-0x46', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x37', to: 'sp-0x38', entrance: 'East to Lobby', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x38', to: 'sp-0x28', entrance: 'Return Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x46', to: 'sp-0x66', entrance: 'Water Drain Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x54', to: 'sp-0x34', entrance: 'Return Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x66', to: 'sp-0x76', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x76', to: 'sp-0x36', entrance: 'Waterfall Return', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x06', to: 'sp-0x16', entrance: 'Boss Reward Room', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x28', to: 'dw-33', entrance: 'Palace Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
