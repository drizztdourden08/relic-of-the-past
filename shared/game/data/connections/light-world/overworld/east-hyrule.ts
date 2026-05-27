import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_EAST_HYRULE_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-15', to: 'zoras-river', entrance: 'Zoras River', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'lw-14', to: 'kings-grave-area', entrance: 'Sanctuary Grave', tags: ['transit:grave', 'dir:one-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'lw-14', to: 'kings-grave-area', entrance: 'Kings Grave Outer Rocks', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'kings-grave-area', to: 'lw-14', entrance: 'Kings Grave Exit', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
  { from: 'graveyard-ledge', to: 'lw-14', entrance: 'Graveyard Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'pyramid-ledge-lw', entrance: 'Top of Pyramid', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
];
