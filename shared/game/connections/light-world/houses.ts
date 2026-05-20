import type { RegionConnection } from '../../types';

export const LW_HOUSE_CONNECTIONS: RegionConnection[] = [
  // Kakariko houses
  { from: 'light-world', to: 'blinds-hideout', entrance: 'Blinds Hideout', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'elder-house', entrance: 'Elder House (East)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'elder-house', entrance: 'Elder House (West)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'snitch-lady-east', entrance: 'Snitch Lady (East)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'snitch-lady-west', entrance: 'Snitch Lady (West)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'bush-covered-house', entrance: 'Bush Covered House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'tavern-front', entrance: 'Tavern (Front)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'light-world-bomb-hut', entrance: 'Light World Bomb Hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'tavern', entrance: 'Tavern North', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'chicken-house', entrance: 'Chicken House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'sick-kids-house', entrance: 'Sick Kids House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'blacksmiths-hut', entrance: 'Blacksmiths Hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'library', entrance: 'Library', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Links House
  { from: 'light-world', to: 'links-house', entrance: 'Links House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'links-house', to: 'light-world', entrance: 'Links House Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Central / South
  { from: 'light-world', to: 'dam', entrance: 'Dam', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'sahasrahlas-hut', entrance: 'Sahasrahlas Hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'lumberjack-house', entrance: 'Lumberjack House', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Death Mountain
  { from: 'death-mountain', to: 'old-man-house', entrance: 'Old Man House (Bottom)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'old-man-house', to: 'old-man-house-back', entrance: 'Old Man House Front to Back', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'old-man-house-back', to: 'death-mountain-return-ledge', entrance: 'Old Man House Back to Ledge', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Two Brothers House (passage between overworld areas)
  { from: 'light-world', to: 'two-brothers-house', entrance: 'Two Brothers House Exit (East)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'two-brothers-house', to: 'maze-race-ledge', entrance: 'Two Brothers House Exit (West)', tags: ['transit:door', 'dir:one-way', 'ctx:exit'] },
];
