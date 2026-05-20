import type { RegionConnection } from '../../types';

export const LW_GAMBLE_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-18', to: 'kakariko-gamble-game', entrance: 'Kakariko Gamble Game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-00', to: 'lost-woods-gamble', entrance: 'Lost Woods Gamble', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
