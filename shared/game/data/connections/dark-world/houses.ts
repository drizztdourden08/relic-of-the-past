import type { RegionConnection } from '../../types';

export const DW_HOUSE_CONNECTIONS: RegionConnection[] = [
  { from: 'dark-desert', to: 'mire-shed', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-18', to: 'brewery', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dw-28', to: 'c-shaped-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
