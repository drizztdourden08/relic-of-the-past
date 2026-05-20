import type { RegionConnection } from '../../types';

export const DW_HOUSE_CONNECTIONS: RegionConnection[] = [
  { from: 'dark-desert', to: 'mire-shed', entrance: 'Mire Shed', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'west-dark-world', to: 'brewery', entrance: 'Brewery', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'west-dark-world', to: 'c-shaped-house', entrance: 'C-Shaped House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
