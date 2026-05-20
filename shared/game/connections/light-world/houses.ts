import type { RegionConnection } from '../../types';

export const LW_HOUSE_CONNECTIONS: RegionConnection[] = [
  // Kakariko houses (all on lw-18: Kakariko NW)
  { from: 'lw-18', to: 'blinds-hideout', entrance: 'Blinds Hideout', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'elder-house', entrance: 'Elder House (East)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'elder-house', entrance: 'Elder House (West)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'snitch-lady-east', entrance: 'Snitch Lady (East)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'snitch-lady-west', entrance: 'Snitch Lady (West)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'bush-covered-house', entrance: 'Bush Covered House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'tavern-front', entrance: 'Tavern (Front)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'light-world-bomb-hut', entrance: 'Light World Bomb Hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'tavern', entrance: 'Tavern North', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'chicken-house', entrance: 'Chicken House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'sick-kids-house', entrance: 'Sick Kids House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-22', to: 'blacksmiths-hut', entrance: 'Blacksmiths Hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-29', to: 'library', entrance: 'Library', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Links House (on lw-2c: Uncle's Estate East)
  { from: 'lw-2c', to: 'links-house', entrance: 'Links House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'links-house', to: 'lw-2c', entrance: 'Links House Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Central / South
  { from: 'lw-3b', to: 'dam', entrance: 'Dam', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-1e', to: 'sahasrahlas-hut', entrance: 'Sahasrahlas Hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-02', to: 'lumberjack-house', entrance: 'Lumberjack House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Death Mountain
  { from: 'death-mountain', to: 'old-man-house', entrance: 'Old Man House (Bottom)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'old-man-house', to: 'old-man-house-back', entrance: 'Old Man House Front to Back', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'old-man-house-back', to: 'death-mountain-return-ledge', entrance: 'Old Man House Back to Ledge', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Two Brothers House (passage between overworld areas)
  { from: 'lw-28', to: 'two-brothers-house', entrance: 'Two Brothers House Exit (East)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'two-brothers-house', to: 'maze-race-ledge', entrance: 'Two Brothers House Exit (West)', tags: ['transit:door', 'dir:one-way', 'ctx:exit'] },
];
