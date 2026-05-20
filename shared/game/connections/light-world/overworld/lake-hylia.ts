import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_LAKE_HYLIA_CONNECTIONS: RegionConnection[] = [
  { from: 'lake-hylia-central-island', to: 'light-world', entrance: 'Lake Hylia Central Island Teleporter', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'lake-hylia-island', to: 'light-world', entrance: 'Lake Hylia Island Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'light-world', to: 'lake-hylia-central-island', entrance: 'Lake Hylia Central Island Pier', tags: ['transit:swim', 'dir:two-way', 'ctx:overworld', 'barrier:swim'] },
];
