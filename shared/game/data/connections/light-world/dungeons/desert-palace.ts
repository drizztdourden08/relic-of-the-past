import type { ScreenConnection } from '../../../../types';

const LW_DESERT_PALACE_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-30', to: 'dp-0x84', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'lw-30', to: 'dp-0x83', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'lw-30', to: 'dp-0x85', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'dp-0x33', to: 'dp-0x43', tags: ['transit:walk', 'dir:two-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'dp-0x43', to: 'dp-0x53', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x53', to: 'dp-0x63', tags: ['transit:walk', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'dp-0x63', to: 'dp-0x73', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x73', to: 'dp-0x74', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x73', to: 'dp-0x83', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x74', to: 'dp-0x84', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x74', to: 'dp-0x75', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x75', to: 'dp-0x85', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x83', to: 'dp-0x84', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x84', to: 'dp-0x85', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'dp-0x84', to: 'lw-30', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'dp-0x83', to: 'lw-30', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'dp-0x85', to: 'lw-30', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];

export { LW_DESERT_PALACE_CONNECTIONS };
