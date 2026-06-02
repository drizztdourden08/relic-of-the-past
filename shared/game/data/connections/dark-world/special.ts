import type { ScreenConnection } from '../../../types';

export const DW_SPECIAL_CONNECTIONS: ScreenConnection[] = [
  { from: 'pyramid-ledge', to: 'pyramid', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'pyramid', to: 'bottom-of-pyramid', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'bottom-of-pyramid', to: 'dw-1b', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Turtle Rock top entrance area
  { from: 'dark-death-mountain-top', to: 'dw-07', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-top', tags: ['transit:warp', 'dir:one-way', 'ctx:overworld', 'barrier:medallion'] },
];
