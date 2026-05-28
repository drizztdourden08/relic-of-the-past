import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_DARK_EAST_CONNECTIONS: RegionConnection[] = [
  { from: 'east-dark-world', to: 'south-dark-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'east-dark-world', to: 'dark-lake-hylia', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'east-dark-world', to: 'northeast-dark-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:hammer'] },
  { from: 'east-dark-world', to: 'west-dark-world', tags: ['transit:hookshot', 'dir:two-way', 'ctx:overworld', 'barrier:hookshot'] },
  { from: 'east-dark-world', to: 'pyramid', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'east-dark-world', to: 'pyramid-ledge', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'pyramid-ledge', to: 'east-dark-world', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'east-dark-world', to: 'lw-27', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'east-dark-world', to: 'hyrule-castle-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
