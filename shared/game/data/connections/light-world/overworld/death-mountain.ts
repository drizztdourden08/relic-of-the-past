import type { ScreenConnection } from '../../../../types';

const LW_OVERWORLD_DEATH_MOUNTAIN_CONNECTIONS: ScreenConnection[] = [
  // West side area transitions
  { from: 'death-mountain-entrance', to: 'death-mountain', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain', to: 'death-mountain-return-ledge', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain', to: 'death-mountain-top', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld', 'barrier:dark'] },
  { from: 'death-mountain-return-ledge', to: 'death-mountain', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain-top', to: 'spectacle-rock', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain-top', to: 'death-mountain', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain-top', to: 'east-death-mountain-top', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'spectacle-rock', to: 'death-mountain-top', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // East side area transitions
  { from: 'east-death-mountain-bottom', to: 'fairy-ascension-plateau', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'east-death-mountain-bottom', to: 'east-death-mountain-top', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
  { from: 'east-death-mountain-top', to: 'spiral-cave-ledge', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'east-death-mountain-top', to: 'mimic-cave-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:overworld'] },
  { from: 'east-death-mountain-top', to: 'east-death-mountain-bottom', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'spiral-cave-ledge', to: 'east-death-mountain-bottom', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'fairy-ascension-plateau', to: 'east-death-mountain-bottom', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'fairy-ascension-ledge', to: 'fairy-ascension-plateau', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain-floating-island-lw', to: 'east-death-mountain-top', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Teleporters (cross-world from overworld)
  { from: 'death-mountain-top', to: 'dark-death-mountain-top', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'east-death-mountain-top', to: 'dark-death-mountain-east-bottom', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },

  // Flute destination
  { from: 'light-world', to: 'death-mountain-entrance', tags: ['transit:warp', 'dir:one-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-entrance', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
];

export { LW_OVERWORLD_DEATH_MOUNTAIN_CONNECTIONS };
