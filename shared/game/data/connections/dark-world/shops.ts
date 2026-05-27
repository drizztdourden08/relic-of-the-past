import type { RegionConnection } from '../../types';

export const DW_SHOP_CONNECTIONS: RegionConnection[] = [
  { from: 'dw-18', to: 'village-of-outcasts-shop', entrance: 'Village of Outcasts Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-35', to: 'dark-lake-hylia-shop', entrance: 'Dark Lake Hylia Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-02', to: 'dark-world-lumberjack-shop', entrance: 'Dark World Lumberjack Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-16', to: 'dark-world-potion-shop', entrance: 'Dark World Potion Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-22', to: 'red-shield-shop', entrance: 'Red Shield Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-2c', to: 'big-bomb-shop', entrance: 'Big Bomb Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-top', to: 'cave-shop-dark-death-mountain', entrance: 'Cave Shop (Dark Death Mountain)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
