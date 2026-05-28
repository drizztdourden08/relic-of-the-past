import type { RegionConnection } from '../../types';

export const LW_HINT_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-11', to: 'fortune-teller-light', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-35', to: 'lake-hylia-fortune-teller', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
