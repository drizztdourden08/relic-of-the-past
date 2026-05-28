import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_DARK_MIRE_CONNECTIONS: RegionConnection[] = [
  // Mirror spots
  { from: 'dark-desert', to: 'desert-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-desert', to: 'desert-northern-cliffs', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-desert', to: 'desert-palace-lone-stairs', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
