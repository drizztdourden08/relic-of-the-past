import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_DARK_NORTH_CONNECTIONS: RegionConnection[] = [
  { from: 'northeast-dark-world', to: 'catfish', entrance: 'Catfish Entrance Rock', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'catfish', to: 'northeast-dark-world', entrance: 'Catfish Exit', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
  { from: 'northeast-dark-world', to: 'east-dark-world', entrance: 'Northeast Dark World South', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },

  // Mirror spot
  { from: 'northeast-dark-world', to: 'lw-1c', entrance: 'Northeast Dark World Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
