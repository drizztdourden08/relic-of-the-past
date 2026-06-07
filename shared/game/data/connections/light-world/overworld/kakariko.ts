/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../../types';

const LW_OVERWORLD_KAKARIKO_CONNECTIONS: ScreenConnection[] = [
  { from: 'maze-race-ledge', to: 'lw-28', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
];

export { LW_OVERWORLD_KAKARIKO_CONNECTIONS };
