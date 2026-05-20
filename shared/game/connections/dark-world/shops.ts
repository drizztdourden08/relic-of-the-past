import type { RegionConnection } from '../../types';

export const DW_SHOP_CONNECTIONS: RegionConnection[] = [
  { from: 'west-dark-world', to: 'village-of-outcasts-shop', entrance: 'Village of Outcasts Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'south-dark-world', to: 'dark-lake-hylia-shop', entrance: 'Dark Lake Hylia Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-lake-hylia', to: 'dark-lake-hylia-shop', entrance: 'Dark Lake Hylia Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'west-dark-world', to: 'dark-world-lumberjack-shop', entrance: 'Dark World Lumberjack Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'west-dark-world', to: 'dark-world-potion-shop', entrance: 'Dark World Potion Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'west-dark-world', to: 'red-shield-shop', entrance: 'Red Shield Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'south-dark-world', to: 'big-bomb-shop', entrance: 'Big Bomb Shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-top', to: 'cave-shop-dark-death-mountain', entrance: 'Cave Shop (Dark Death Mountain)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
