import type { RegionConnection } from '../../types';

export const DW_FAIRY_CONNECTIONS: RegionConnection[] = [
  { from: 'dw-1b', to: 'pyramid-fairy', entrance: 'Pyramid Fairy', tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'] },
  { from: 'dw-2b', to: 'bonk-fairy-dark', entrance: 'Bonk Fairy (Dark)', tags: ['transit:bonk', 'dir:two-way', 'ctx:entrance', 'barrier:dash'] },
  { from: 'dw-35', to: 'dark-lake-hylia-healer-fairy', entrance: 'Dark Lake Hylia Fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-healer-fairy', entrance: 'Dark Lake Hylia Ledge Fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-desert', to: 'dark-desert-healer-fairy', entrance: 'Dark Desert Fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-west-bottom', to: 'dark-death-mountain-healer-fairy', entrance: 'Dark Death Mountain Fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
