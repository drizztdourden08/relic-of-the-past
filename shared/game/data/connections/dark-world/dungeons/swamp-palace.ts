import type { ScreenConnection } from '../../../../types';

export const DW_SWAMP_PALACE_CONNECTIONS: ScreenConnection[] = [
  { from: 'dw-3b', to: 'sp-0x28', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'sp-0x06', to: 'sp-0x16', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x16', to: 'sp-0x26', tags: ['transit:walk', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'sp-0x25', to: 'sp-0x35', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x26', to: 'sp-0x25', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x26', to: 'sp-0x36', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x28', to: 'sp-0x38', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x34', to: 'sp-0x35', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x34', to: 'sp-0x54', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x35', to: 'sp-0x36', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x36', to: 'sp-0x37', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x36', to: 'sp-0x46', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x37', to: 'sp-0x38', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x38', to: 'sp-0x28', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x46', to: 'sp-0x66', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x54', to: 'sp-0x34', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x66', to: 'sp-0x76', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x76', to: 'sp-0x36', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x06', to: 'sp-0x16', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'sp-0x28', to: 'dw-33', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
