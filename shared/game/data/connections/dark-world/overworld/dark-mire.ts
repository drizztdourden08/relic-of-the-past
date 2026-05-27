import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_DARK_MIRE_CONNECTIONS: RegionConnection[] = [
  // Mirror spots
  { from: 'dark-desert', to: 'desert-ledge', entrance: 'Dark Desert Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-desert', to: 'desert-northern-cliffs', entrance: 'Dark Desert North Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-desert', to: 'desert-palace-lone-stairs', entrance: 'Dark Desert Lone Stairs Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
