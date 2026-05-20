import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_EAST_HYRULE_CONNECTIONS: RegionConnection[] = [
  { from: 'light-world', to: 'zoras-river', entrance: 'Zoras River', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'light-world', to: 'kings-grave-area', entrance: 'Sanctuary Grave', tags: ['transit:grave', 'dir:one-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'light-world', to: 'kings-grave-area', entrance: 'Kings Grave Outer Rocks', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'kings-grave-area', to: 'light-world', entrance: 'Kings Grave Exit', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
  { from: 'graveyard-ledge', to: 'light-world', entrance: 'Graveyard Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'light-world', to: 'pyramid-ledge-lw', entrance: 'Top of Pyramid', tags: ['transit:walk', 'dir:one-way', 'ctx:overworld'] },
];
