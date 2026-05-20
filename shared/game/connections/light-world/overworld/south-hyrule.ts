import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_SOUTH_HYRULE_CONNECTIONS: RegionConnection[] = [
  { from: 'cave-45-ledge', to: 'lw-32', entrance: 'Cave 45 Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'bombos-tablet-ledge', to: 'lw-30', entrance: 'Bombos Tablet Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Cross-world teleporters originating from LW overworld
  { from: 'lw-1e', to: 'east-dark-world', entrance: 'East Hyrule Teleporter', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'lw-3c', to: 'south-dark-world', entrance: 'South Hyrule Teleporter', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'lw-20', to: 'west-dark-world', entrance: 'Kakariko Teleporter', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'light-world', to: 'dark-desert', entrance: 'Dark Desert Teleporter', tags: ['transit:warp', 'dir:one-way', 'ctx:cross-world'] },
];
