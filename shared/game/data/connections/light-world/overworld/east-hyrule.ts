import type { ScreenConnection } from '../../../../types';

export const LW_OVERWORLD_EAST_HYRULE_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-15', to: 'zoras-river', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'lw-14', to: 'kings-grave-area', tags: ['transit:grave', 'dir:one-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'lw-14', to: 'kings-grave-area', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'kings-grave-area', to: 'lw-14', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
  { from: 'graveyard-ledge', to: 'lw-14', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'pyramid-ledge-lw', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
];
