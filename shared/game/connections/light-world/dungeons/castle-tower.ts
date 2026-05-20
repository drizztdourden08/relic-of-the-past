import type { RegionConnection } from '../../../types';

export const LW_CASTLE_TOWER_CONNECTIONS: RegionConnection[] = [
  { from: 'hyrule-castle-courtyard', to: 'agahnims-tower', entrance: 'Agahnims Tower', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter', 'barrier:event'] },
  { from: 'agahnims-tower', to: 'agahnim-1', entrance: 'Agahnim 1', tags: ['transit:stairs', 'dir:one-way', 'ctx:boss', 'barrier:small-key'] },
];
