import type { ScreenConnection } from '../../../../types';

const DW_OVERWORLD_DARK_LAKE_HYLIA_CONNECTIONS: ScreenConnection[] = [
  { from: 'dark-lake-hylia', to: 'dark-lake-hylia-central-island', tags: ['transit:warp', 'dir:one-way', 'ctx:overworld'] },
  { from: 'dark-lake-hylia', to: 'dark-lake-hylia-ledge', tags: ['transit:swim', 'dir:two-way', 'ctx:overworld', 'barrier:swim'] },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'dark-lake-hylia', to: 'lw-37', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-lake-hylia', to: 'lake-hylia-island', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-lake-hylia-central-island', to: 'lake-hylia-central-island', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];

export { DW_OVERWORLD_DARK_LAKE_HYLIA_CONNECTIONS };
