import type { RegionConnection } from '../../../types';

export const LW_TOWER_OF_HERA_CONNECTIONS: RegionConnection[] = [
  { from: 'death-mountain-top', to: 'tower-of-hera-bottom', entrance: 'Tower of Hera', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'tower-of-hera-bottom', to: 'tower-of-hera-basement', entrance: 'Tower of Hera Small Key Door', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'tower-of-hera-bottom', to: 'tower-of-hera-top', entrance: 'Tower of Hera Big Key Door', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
];
