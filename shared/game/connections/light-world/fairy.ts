import type { RegionConnection } from '../../types';

export const LW_FAIRY_CONNECTIONS: RegionConnection[] = [
  { from: 'light-world', to: 'bonk-fairy-light', entrance: 'Bonk Fairy (Light)', tags: ['transit:bonk', 'dir:two-way', 'ctx:entrance', 'barrier:dash'] },
  { from: 'lake-hylia-central-island', to: 'capacity-upgrade', entrance: 'Capacity Upgrade', tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'waterfall-of-wishing', entrance: 'Waterfall of Wishing', tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance', 'barrier:swim'] },
  { from: 'zoras-river', to: 'waterfall-of-wishing', entrance: 'Waterfall of Wishing', tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance', 'barrier:swim'] },
  { from: 'light-world', to: 'north-fairy-cave', entrance: 'North Fairy Cave Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'lake-hylia-healer-fairy', entrance: 'Lake Hylia Fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'swamp-healer-fairy', entrance: 'Light Hype Fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'desert-healer-fairy', entrance: 'Desert Fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'long-fairy-cave', entrance: 'Long Fairy Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'east-death-mountain-bottom', to: 'hookshot-fairy', entrance: 'Hookshot Fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
