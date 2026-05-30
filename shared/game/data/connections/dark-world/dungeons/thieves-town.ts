import type { ScreenConnection } from '../../../../types';

export const DW_THIEVES_TOWN_CONNECTIONS: ScreenConnection[] = [
  { from: 'dw-18', to: 'tt-0xdc', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'tt-0x44', to: 'tt-0x45', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0x44', to: 'tt-0x64', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0x45', to: 'tt-0x65', tags: ['transit:walk', 'dir:two-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'tt-0x64', to: 'tt-0x65', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xab', to: 'tt-0xac', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xab', to: 'tt-0xbb', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xac', to: 'tt-0xbc', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xbb', to: 'tt-0xcb', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xbb', to: 'tt-0xbc', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xbc', to: 'tt-0xcc', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xcb', to: 'tt-0xdb', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xcb', to: 'tt-0xcc', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xcc', to: 'tt-0xdc', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xdb', to: 'tt-0xdc', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'tt-0xdc', to: 'tt-0x44', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'tt-0xdc', to: 'dw-18', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
