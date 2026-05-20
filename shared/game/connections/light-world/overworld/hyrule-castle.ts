import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_HYRULE_CASTLE_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-1b', to: 'hyrule-castle-courtyard', entrance: 'Hyrule Castle Main Gate', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'hyrule-castle-ledge', to: 'hyrule-castle-courtyard', entrance: 'Hyrule Castle Ledge Courtyard Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'hyrule-castle-ledge', to: 'lw-1b', entrance: 'Hyrule Castle Ledge Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:overworld'] },
];
