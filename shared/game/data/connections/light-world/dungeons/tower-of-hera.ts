import type { ScreenConnection } from '../../../../types';

export const LW_TOWER_OF_HERA_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-03', to: 'toh-0x77', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'toh-0x07', to: 'toh-0x17', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'toh-0x17', to: 'toh-0x27', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x17', to: 'toh-0x07', tags: ['transit:stairs', 'dir:two-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'toh-0x27', to: 'toh-0x31', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x31', to: 'toh-0x77', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x77', to: 'toh-0xa7', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x77', to: 'toh-0x87', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'toh-0x87', to: 'toh-0x77', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'toh-0xa7', to: 'toh-0x17', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x77', to: 'lw-03', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
