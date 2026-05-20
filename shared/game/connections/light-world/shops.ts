import type { RegionConnection } from '../../types';

export const LW_SHOP_CONNECTIONS: RegionConnection[] = [
  { from: 'light-world', to: 'kakariko-shop', entrance: 'Kakariko Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'cave-shop-lake-hylia', entrance: 'Cave Shop (Lake Hylia)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'death-mountain', to: 'light-world-death-mountain-shop', entrance: 'Light World Death Mountain Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'potion-shop', entrance: 'Potion Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
