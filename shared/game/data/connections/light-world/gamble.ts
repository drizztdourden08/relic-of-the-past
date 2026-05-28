import type { RegionConnection } from '../../types';

export const LW_GAMBLE_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-18', to: 'kakariko-gamble-game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-00', to: 'lost-woods-gamble', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
