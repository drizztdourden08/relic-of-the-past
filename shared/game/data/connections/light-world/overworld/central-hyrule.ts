import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_CENTRAL_CONNECTIONS: RegionConnection[] = [
  // Save & Quit → overworld
  { from: 'menu', to: 'links-house', tags: ['transit:warp', 'dir:one-way', 'ctx:save-quit'] },

  // Rain state transitions
  { from: 'links-house', to: 'light-world-rain', tags: ['transit:door', 'dir:one-way', 'ctx:exit', 'barrier:event'] },
  { from: 'light-world-rain', to: 'hyrule-castle-courtyard', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld', 'barrier:event'] },
];
