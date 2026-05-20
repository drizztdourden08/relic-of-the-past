import type { RegionConnection } from '../../types';

export const DW_SPECIAL_CONNECTIONS: RegionConnection[] = [
  { from: 'pyramid-ledge', to: 'pyramid', entrance: 'Pyramid Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'pyramid', to: 'bottom-of-pyramid', entrance: 'Pyramid Exit', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'bottom-of-pyramid', to: 'east-dark-world', entrance: 'Bottom of Pyramid Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Turtle Rock top entrance area
  { from: 'turtle-rock-top', to: 'turtle-rock-entrance', entrance: 'Turtle Rock', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'dark-death-mountain-top', to: 'turtle-rock-top', entrance: 'Turtle Rock', tags: ['transit:warp', 'dir:one-way', 'ctx:overworld', 'barrier:medallion'] },
];
