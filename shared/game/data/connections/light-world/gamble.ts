import type { ScreenConnection } from '../../../types';

const LW_GAMBLE_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-18', to: 'kakariko-gamble-game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-00', to: 'lost-woods-gamble', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];

export { LW_GAMBLE_CONNECTIONS };
