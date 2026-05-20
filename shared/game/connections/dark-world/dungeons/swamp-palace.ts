import type { RegionConnection } from '../../../types';

export const DW_SWAMP_PALACE_CONNECTIONS: RegionConnection[] = [
  { from: 'south-dark-world', to: 'swamp-palace-entrance', entrance: 'Swamp Palace', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'swamp-palace-entrance', to: 'swamp-palace-first-room', entrance: 'Swamp Palace Moat', tags: ['transit:swim', 'dir:two-way', 'ctx:internal', 'barrier:swim'] },
  { from: 'swamp-palace-first-room', to: 'swamp-palace-starting-area', entrance: 'Swamp Palace Small Key Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'swamp-palace-starting-area', to: 'swamp-palace-center', entrance: 'Swamp Palace (Center)', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'swamp-palace-center', to: 'swamp-palace-north', entrance: 'Swamp Palace (North)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'swamp-palace-center', to: 'swamp-palace-west', entrance: 'Swamp Palace (West)', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
];
