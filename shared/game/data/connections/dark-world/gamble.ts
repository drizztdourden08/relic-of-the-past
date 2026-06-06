import type { ScreenConnection } from '../../../types';

const DW_GAMBLE_CONNECTIONS: ScreenConnection[] = [
  { from: 'dw-18', to: 'chest-game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-2a', to: 'archery-game', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];

export { DW_GAMBLE_CONNECTIONS };
