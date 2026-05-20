import type { RegionConnection } from '../../../types';

export const LW_EASTERN_PALACE_CONNECTIONS: RegionConnection[] = [
  { from: 'overworld', to: 'ep-0xc9', entrance: 'Palace Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'ep-0x89', to: 'ep-0xa9', entrance: 'Big Key Door Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'ep-0x89', to: 'ep-0x99', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0x99', to: 'ep-0xda', entrance: 'Reward Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0x99', to: 'ep-0xa9', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xa8', to: 'ep-0xb8', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xa8', to: 'ep-0xa9', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xa9', to: 'ep-0xb9', entrance: 'South to Lobby', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xa9', to: 'ep-0xaa', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xaa', to: 'ep-0xba', entrance: 'South Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xb8', to: 'ep-0xc8', entrance: 'South to Map Room', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xb8', to: 'ep-0xb9', entrance: 'East to Lobby', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xb9', to: 'ep-0xc9', entrance: 'South to Entrance', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xb9', to: 'ep-0xba', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xc8', to: 'ep-0xd8', entrance: 'South to Compass', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xc8', to: 'ep-0xc9', entrance: 'East to Entrance', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xc9', to: 'ep-0xd9', entrance: 'Boss Door', tags: ['transit:walk', 'dir:two-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'ep-0xd8', to: 'ep-0xd9', entrance: 'East Passage', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xd9', to: 'ep-0xda', entrance: 'East to Reward', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xc9', to: 'lw-1e', entrance: 'Palace Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
