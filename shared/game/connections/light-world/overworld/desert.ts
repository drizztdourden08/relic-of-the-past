import type { RegionConnection } from '../../../types';

export const LW_OVERWORLD_DESERT_CONNECTIONS: RegionConnection[] = [
  { from: 'light-world', to: 'desert-palace-stairs', entrance: 'Desert Palace Stairs', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'desert-palace-stairs', to: 'desert-palace-entrance-north-spot', entrance: 'Desert Palace Stairs Ascent', tags: ['transit:stairs', 'dir:one-way', 'ctx:overworld', 'barrier:book'] },
  { from: 'desert-palace-stairs', to: 'light-world', entrance: 'Desert Palace Stairs Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'desert-ledge', to: 'light-world', entrance: 'Desert Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'desert-ledge-northeast', to: 'desert-ledge', entrance: 'Desert Ledge (Northeast) Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'desert-palace-lone-stairs', to: 'desert-ledge', entrance: 'Desert Palace Lone Stairs Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'desert-northern-cliffs', to: 'desert-ledge-northeast', entrance: 'Desert Northern Cliffs Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
];
