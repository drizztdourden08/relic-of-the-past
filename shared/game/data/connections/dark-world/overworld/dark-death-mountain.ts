/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../../types';

const DW_OVERWORLD_DARK_DEATH_MOUNTAIN_CONNECTIONS: ScreenConnection[] = [
  // West
  { from: 'dark-death-mountain-west-bottom', to: 'dark-death-mountain-top', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },

  // Top transitions
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-west-bottom', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-east-bottom', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },

  // East
  { from: 'dark-death-mountain-east-bottom', to: 'dark-death-mountain-top', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },

  // Ledge
  { from: 'dark-death-mountain-ledge', to: 'dark-death-mountain-west-bottom', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'dark-death-mountain-ledge', to: 'dark-death-mountain-top', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Isolated Ledge
  { from: 'dark-death-mountain-isolated-ledge', to: 'dark-death-mountain-top', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Floating Island
  { from: 'death-mountain-floating-island-dw', to: 'dark-death-mountain-top', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Bunny Descent
  { from: 'dark-death-mountain-bunny-descent', to: 'dark-death-mountain-east-bottom', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots (cross-world)
  { from: 'dark-death-mountain-west-bottom', to: 'death-mountain-entrance', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-death-mountain-east-bottom', to: 'east-death-mountain-bottom', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-death-mountain-ledge', to: 'death-mountain-top', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-death-mountain-isolated-ledge', to: 'fairy-ascension-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'death-mountain-floating-island-dw', to: 'death-mountain-floating-island-lw', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-death-mountain-top', to: 'east-death-mountain-top', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];

export { DW_OVERWORLD_DARK_DEATH_MOUNTAIN_CONNECTIONS };
