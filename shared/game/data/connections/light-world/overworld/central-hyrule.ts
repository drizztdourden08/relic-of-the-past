import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_CENTRAL_CONNECTIONS: RegionConnection[] = [
  // Save & Quit → overworld
  { from: 'menu', to: 'links-house', entrance: 'Links House S&Q', tags: ['transit:warp', 'dir:one-way', 'ctx:save-quit'] },

  // Rain state transitions
  { from: 'links-house', to: 'light-world-rain', entrance: 'Links House Exit (Rain)', tags: ['transit:door', 'dir:one-way', 'ctx:exit', 'barrier:event'] },
  { from: 'light-world-rain', to: 'hyrule-castle-courtyard', entrance: 'HC Main Gate (Rain)', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld', 'barrier:event'] },
];
