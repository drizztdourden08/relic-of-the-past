import type { ScreenConnection } from '../../../types';

export const LW_SHOP_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-18', to: 'kakariko-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-35', to: 'cave-shop-lake-hylia', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'death-mountain', to: 'light-world-death-mountain-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-16', to: 'potion-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
