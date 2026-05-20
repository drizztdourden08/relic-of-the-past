import type { RegionConnection } from '../../../types';

export const DW_THIEVES_TOWN_CONNECTIONS: RegionConnection[] = [
  { from: 'west-dark-world', to: 'thieves-town-entrance', entrance: 'Thieves Town', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'thieves-town-entrance', to: 'thieves-town-deep', entrance: 'Thieves Town Big Key Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'thieves-town-deep', to: 'blind-fight', entrance: 'Blind Fight', tags: ['transit:door', 'dir:one-way', 'ctx:boss'] },
];
