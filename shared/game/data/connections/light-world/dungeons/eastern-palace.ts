import type { RegionConnection } from '../../../types';

export const LW_EASTERN_PALACE_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-1e', to: 'ep-0xc9', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'ep-0x89', to: 'ep-0xa9', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'ep-0x89', to: 'ep-0x99', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0x99', to: 'ep-0xda', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0x99', to: 'ep-0xa9', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xa8', to: 'ep-0xb8', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xa8', to: 'ep-0xa9', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xa9', to: 'ep-0xb9', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xa9', to: 'ep-0xaa', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xaa', to: 'ep-0xba', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xb8', to: 'ep-0xc8', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xb8', to: 'ep-0xb9', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xb9', to: 'ep-0xc9', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xb9', to: 'ep-0xba', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xc8', to: 'ep-0xd8', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xc8', to: 'ep-0xc9', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xc9', to: 'ep-0xd9', tags: ['transit:walk', 'dir:two-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'ep-0xd8', to: 'ep-0xd9', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xd9', to: 'ep-0xda', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'ep-0xc9', to: 'lw-1e', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
