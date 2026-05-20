import type { RegionConnection } from '../../../types';

export const LW_TOWER_OF_HERA_CONNECTIONS: RegionConnection[] = [
  { from: 'overworld', to: 'toh-0x77', entrance: 'Tower Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'toh-0x07', to: 'toh-0x17', entrance: 'Moldorm Fall', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'toh-0x17', to: 'toh-0x27', entrance: '5F Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x27', to: 'toh-0x31', entrance: '3F Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x31', to: 'toh-0x77', entrance: '2F Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x77', to: 'toh-0xa7', entrance: 'Basement Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x77', to: 'toh-0x87', entrance: 'Cage Hole', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'toh-0xa7', to: 'toh-0x17', entrance: '4F Return Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'toh-0x77', to: 'lw-03', entrance: 'Tower Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
