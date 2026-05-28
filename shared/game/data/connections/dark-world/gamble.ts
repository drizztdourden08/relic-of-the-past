import type { RegionConnection } from '../../types';

export const DW_GAMBLE_CONNECTIONS: RegionConnection[] = [
  { from: 'dw-18', to: 'chest-game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-2a', to: 'archery-game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
