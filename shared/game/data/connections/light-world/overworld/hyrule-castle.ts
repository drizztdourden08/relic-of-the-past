/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../../types';

const LW_OVERWORLD_HYRULE_CASTLE_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-1b', to: 'hyrule-castle-courtyard', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'hyrule-castle-ledge', to: 'hyrule-castle-courtyard', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'hyrule-castle-ledge', to: 'lw-1b', tags: ['transit:mirror', 'dir:one-way', 'ctx:overworld'] },
];

export { LW_OVERWORLD_HYRULE_CASTLE_CONNECTIONS };
