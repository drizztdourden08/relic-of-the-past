import type { ScreenConnection } from '../../../../types';

const LW_CASTLE_TOWER_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-1b', to: 'ct-0xe0', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'ct-0x20', to: 'ct-0x30', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0x30', to: 'ct-0x40', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0x40', to: 'ct-0xb0', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0xb0', to: 'ct-0xc0', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0xc0', to: 'ct-0xd0', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0xd0', to: 'ct-0xe0', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0x20', to: 'ct-0x30', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'ct-0xe0', to: 'lw-1b', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'ct-0x20', to: 'lw-1b', tags: ['transit:warp', 'dir:one-way', 'ctx:exit'] },
  { from: 'ct-0xe0', to: 'ct-0xd0', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
];

export { LW_CASTLE_TOWER_CONNECTIONS };
