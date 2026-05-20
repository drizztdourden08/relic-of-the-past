import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_DEATH_MOUNTAIN_CONNECTIONS: RegionConnection[] = [
  // West side area transitions
  { from: 'death-mountain-entrance', to: 'death-mountain', entrance: 'Death Mountain Entrance Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain', to: 'death-mountain-return-ledge', entrance: 'Death Mountain Return Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain', to: 'death-mountain-top', entrance: 'Death Mountain Climb', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld', 'barrier:dark'] },
  { from: 'death-mountain-return-ledge', to: 'death-mountain', entrance: 'Death Mountain Return Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain-top', to: 'spectacle-rock', entrance: 'Spectacle Rock Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain-top', to: 'death-mountain', entrance: 'Death Mountain Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain-top', to: 'east-death-mountain-top', entrance: 'Death Mountain (Top) to East', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'spectacle-rock', to: 'death-mountain-top', entrance: 'Spectacle Rock Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // East side area transitions
  { from: 'east-death-mountain-bottom', to: 'fairy-ascension-plateau', entrance: 'Fairy Ascension Plateau', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'east-death-mountain-bottom', to: 'east-death-mountain-top', entrance: 'East Death Mountain Climb', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
  { from: 'east-death-mountain-top', to: 'spiral-cave-ledge', entrance: 'Spiral Cave Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'east-death-mountain-top', to: 'mimic-cave-ledge', entrance: 'Mimic Cave Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:overworld'] },
  { from: 'east-death-mountain-top', to: 'east-death-mountain-bottom', entrance: 'East Death Mountain Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'spiral-cave-ledge', to: 'east-death-mountain-bottom', entrance: 'Spiral Cave Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'fairy-ascension-plateau', to: 'east-death-mountain-bottom', entrance: 'Fairy Ascension Plateau Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'fairy-ascension-ledge', to: 'fairy-ascension-plateau', entrance: 'Fairy Ascension Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'death-mountain-floating-island-lw', to: 'east-death-mountain-top', entrance: 'Death Mountain Floating Island Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Teleporters (cross-world from overworld)
  { from: 'death-mountain-top', to: 'dark-death-mountain-top', entrance: 'Death Mountain (Top) Teleporter', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'east-death-mountain-top', to: 'dark-death-mountain-east-bottom', entrance: 'East Death Mountain Teleporter', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },

  // Flute destination
  { from: 'light-world', to: 'death-mountain-entrance', entrance: 'Flute Spot 1', tags: ['transit:warp', 'dir:one-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-entrance', entrance: 'Death Mountain Entrance Rock', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
];
