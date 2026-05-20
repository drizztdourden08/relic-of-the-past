import type { RegionConnection } from '../../types';

export const LW_HINT_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-11', to: 'fortune-teller-light', entrance: 'Fortune Teller (Light)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-35', to: 'lake-hylia-fortune-teller', entrance: 'Lake Hylia Fortune Teller', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
