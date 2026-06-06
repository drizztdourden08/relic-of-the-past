import type { ScreenConnection } from '../../../types';

const LW_SPECIAL_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-1b', to: 'chris-houlihan-room', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance', 'barrier:glitch'] },
  { from: 'chris-houlihan-room', to: 'lw-2c', tags: ['transit:warp', 'dir:one-way', 'ctx:exit', 'barrier:glitch'] },
];

export { LW_SPECIAL_CONNECTIONS };
