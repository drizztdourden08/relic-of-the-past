import type { RegionConnection } from '../../types';

export const LW_WELL_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-18', to: 'kakariko-well-top', entrance: 'Kakariko Well Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'kakariko-well-bottom', entrance: 'Kakariko Well Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'kakariko-well-top', to: 'kakariko-well-bottom', entrance: 'Kakariko Well Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'kakariko-well-bottom', to: 'lw-18', entrance: 'Kakariko Well Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
