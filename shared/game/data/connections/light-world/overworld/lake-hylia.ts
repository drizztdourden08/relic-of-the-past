import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_LAKE_HYLIA_CONNECTIONS: RegionConnection[] = [
  { from: 'lake-hylia-central-island', to: 'lw-35', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'lake-hylia-island', to: 'lw-35', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'lw-35', to: 'lake-hylia-central-island', tags: ['transit:swim', 'dir:two-way', 'ctx:overworld', 'barrier:swim'] },
];
