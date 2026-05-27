import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_DARK_EAST_CONNECTIONS: RegionConnection[] = [
  { from: 'east-dark-world', to: 'south-dark-world', entrance: 'South Dark World Bridge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'east-dark-world', to: 'dark-lake-hylia', entrance: 'Dark Lake Hylia Drop (East)', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'east-dark-world', to: 'northeast-dark-world', entrance: 'Northeast Dark World Hammer Bridge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:hammer'] },
  { from: 'east-dark-world', to: 'west-dark-world', entrance: 'West Dark World Gap', tags: ['transit:hookshot', 'dir:two-way', 'ctx:overworld', 'barrier:hookshot'] },
  { from: 'east-dark-world', to: 'pyramid', entrance: 'Pyramid', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'east-dark-world', to: 'pyramid-ledge', entrance: 'Pyramid Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'pyramid-ledge', to: 'east-dark-world', entrance: 'Pyramid Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'east-dark-world', to: 'lw-27', entrance: 'East Dark World Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'east-dark-world', to: 'hyrule-castle-ledge', entrance: 'Hyrule Castle Ledge Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
