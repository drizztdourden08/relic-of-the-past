import type { ScreenConnection } from '../../../../types';

const DW_OVERWORLD_DARK_SOUTH_CONNECTIONS: ScreenConnection[] = [
  { from: 'south-dark-world', to: 'dark-lake-hylia', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'south-dark-world', to: 'east-dark-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'south-dark-world', to: 'dark-grassy-lawn', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:hammer'] },
  { from: 'south-dark-world', to: 'west-dark-world', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'dark-grassy-lawn', to: 'south-dark-world', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'south-dark-world', to: 'lw-2c', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'south-dark-world', to: 'maze-race-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'south-dark-world', to: 'cave-45-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'south-dark-world', to: 'bombos-tablet-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];

export { DW_OVERWORLD_DARK_SOUTH_CONNECTIONS };
