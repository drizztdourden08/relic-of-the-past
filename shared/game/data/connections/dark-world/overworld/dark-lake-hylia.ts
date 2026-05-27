import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_DARK_LAKE_HYLIA_CONNECTIONS: RegionConnection[] = [
  { from: 'dark-lake-hylia', to: 'dark-lake-hylia-central-island', entrance: 'Dark Lake Hylia Teleporter', tags: ['transit:warp', 'dir:one-way', 'ctx:overworld'] },
  { from: 'dark-lake-hylia', to: 'dark-lake-hylia-ledge', entrance: 'Dark Lake Hylia Ledge Pier', tags: ['transit:swim', 'dir:two-way', 'ctx:overworld', 'barrier:swim'] },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia', entrance: 'Dark Lake Hylia Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'dark-lake-hylia', to: 'lw-37', entrance: 'Dark Lake Hylia Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-lake-hylia', to: 'lake-hylia-island', entrance: 'Dark Lake Hylia Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-lake-hylia-central-island', to: 'lake-hylia-central-island', entrance: 'Dark Lake Hylia Central Island Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
