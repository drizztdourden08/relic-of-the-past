/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../../types';

const LW_OVERWORLD_SOUTH_HYRULE_CONNECTIONS: ScreenConnection[] = [
  { from: 'cave-45-ledge', to: 'lw-32', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'bombos-tablet-ledge', to: 'lw-30', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Cross-world teleporters originating from LW overworld
  { from: 'lw-1e', to: 'east-dark-world', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'lw-3c', to: 'south-dark-world', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'lw-10', to: 'west-dark-world', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'lw-30', to: 'dark-desert', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
];

export { LW_OVERWORLD_SOUTH_HYRULE_CONNECTIONS };
