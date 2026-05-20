import type { RegionConnection } from '../../types';

export const DW_GAMBLE_CONNECTIONS: RegionConnection[] = [
  { from: 'west-dark-world', to: 'chest-game', entrance: 'Chest Game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'south-dark-world', to: 'archery-game', entrance: 'Archery Game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
