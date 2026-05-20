import type { RegionConnection } from '../../../types';

export const LW_DESERT_PALACE_CONNECTIONS: RegionConnection[] = [
  // Entrances
  { from: 'desert-palace-entrance-north-spot', to: 'desert-palace-north', entrance: 'Desert Palace Entrance (North)', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'desert-ledge', to: 'desert-palace-main-outer', entrance: 'Desert Palace Entrance (South)', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'desert-palace-lone-stairs', to: 'desert-palace-main-outer', entrance: 'Desert Palace Entrance (East)', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },

  // Internal
  { from: 'desert-palace-main-outer', to: 'desert-palace-east', entrance: 'Desert Palace East Wing', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'desert-palace-main-outer', to: 'desert-palace-main-inner', entrance: 'Desert Palace Pots (Outer)', tags: ['transit:walk', 'dir:one-way', 'ctx:internal'] },
  { from: 'desert-palace-main-inner', to: 'desert-palace-main-outer', entrance: 'Desert Palace Pots (Inner)', tags: ['transit:walk', 'dir:one-way', 'ctx:internal'] },
  { from: 'desert-palace-north', to: 'desert-palace-main-outer', entrance: 'Desert Palace Exit (North)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
];
