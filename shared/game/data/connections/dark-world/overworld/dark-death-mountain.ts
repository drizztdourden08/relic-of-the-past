import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_DARK_DEATH_MOUNTAIN_CONNECTIONS: RegionConnection[] = [
  // West
  { from: 'dark-death-mountain-west-bottom', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Climb (West)', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },

  // Top transitions
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-west-bottom', entrance: 'Dark Death Mountain Drop (West)', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-east-bottom', entrance: 'Dark Death Mountain Drop (East)', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'dark-death-mountain-top', to: 'dark-death-mountain-ledge', entrance: 'Dark Death Mountain Ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },

  // East
  { from: 'dark-death-mountain-east-bottom', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Climb (East)', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },

  // Ledge
  { from: 'dark-death-mountain-ledge', to: 'dark-death-mountain-west-bottom', entrance: 'Dark Death Mountain Ledge Drop (West)', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'dark-death-mountain-ledge', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Ledge Drop (Top)', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Isolated Ledge
  { from: 'dark-death-mountain-isolated-ledge', to: 'dark-death-mountain-top', entrance: 'Dark Death Mountain Isolated Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Floating Island
  { from: 'death-mountain-floating-island-dw', to: 'dark-death-mountain-top', entrance: 'Death Mountain Floating Island Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Bunny Descent
  { from: 'dark-death-mountain-bunny-descent', to: 'dark-death-mountain-east-bottom', entrance: 'Dark Death Mountain Bunny Descent', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots (cross-world)
  { from: 'dark-death-mountain-west-bottom', to: 'death-mountain-entrance', entrance: 'Dark Death Mountain (West Bottom) Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-death-mountain-east-bottom', to: 'east-death-mountain-bottom', entrance: 'Dark Death Mountain (East Bottom) Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-death-mountain-ledge', to: 'death-mountain-top', entrance: 'Dark Death Mountain Ledge Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-death-mountain-isolated-ledge', to: 'fairy-ascension-ledge', entrance: 'Dark Death Mountain Isolated Ledge Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'death-mountain-floating-island-dw', to: 'death-mountain-floating-island-lw', entrance: 'Death Mountain Floating Island Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-death-mountain-top', to: 'east-death-mountain-top', entrance: 'East Death Mountain (Top) Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
