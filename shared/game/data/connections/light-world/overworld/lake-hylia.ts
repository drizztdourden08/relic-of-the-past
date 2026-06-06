import type { ScreenConnection } from '../../../../types';

const LW_OVERWORLD_LAKE_HYLIA_CONNECTIONS: ScreenConnection[] = [
  { from: 'lake-hylia-central-island', to: 'lw-35', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'lake-hylia-island', to: 'lw-35', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'lw-35', to: 'lake-hylia-central-island', tags: ['transit:swim', 'dir:two-way', 'ctx:overworld', 'barrier:swim'] },
];

export { LW_OVERWORLD_LAKE_HYLIA_CONNECTIONS };
