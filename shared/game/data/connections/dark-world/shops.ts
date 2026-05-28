import type { RegionConnection } from '../../types';

export const DW_SHOP_CONNECTIONS: RegionConnection[] = [
  { from: 'dw-18', to: 'village-of-outcasts-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-35', to: 'dark-lake-hylia-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-02', to: 'dark-world-lumberjack-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-16', to: 'dark-world-potion-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-22', to: 'red-shield-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-2c', to: 'big-bomb-shop', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-top', to: 'cave-shop-dark-death-mountain', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
