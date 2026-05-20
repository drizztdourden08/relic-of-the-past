import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_DARK_SOUTH_CONNECTIONS: RegionConnection[] = [
  { from: 'south-dark-world', to: 'dark-lake-hylia', entrance: 'Dark Lake Hylia Drop (South)', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'south-dark-world', to: 'east-dark-world', entrance: 'East Dark World Bridge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'south-dark-world', to: 'dark-grassy-lawn', entrance: 'Dark Grassy Lawn Pegs', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:hammer'] },
  { from: 'south-dark-world', to: 'west-dark-world', entrance: 'Village of Outcasts Heavy Rock', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'dark-grassy-lawn', to: 'south-dark-world', entrance: 'Dark Grassy Lawn Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'south-dark-world', to: 'light-world', entrance: 'South Dark World Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'south-dark-world', to: 'maze-race-ledge', entrance: 'Maze Race Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'south-dark-world', to: 'cave-45-ledge', entrance: 'Cave 45 Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'south-dark-world', to: 'bombos-tablet-ledge', entrance: 'Bombos Tablet Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
