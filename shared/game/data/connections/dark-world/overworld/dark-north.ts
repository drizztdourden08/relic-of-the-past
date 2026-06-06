import type { ScreenConnection } from '../../../../types';

const DW_OVERWORLD_DARK_NORTH_CONNECTIONS: ScreenConnection[] = [
  { from: 'northeast-dark-world', to: 'catfish', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'catfish', to: 'northeast-dark-world', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
  { from: 'northeast-dark-world', to: 'east-dark-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },

  // Mirror spot
  { from: 'northeast-dark-world', to: 'lw-1c', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];

export { DW_OVERWORLD_DARK_NORTH_CONNECTIONS };
