import type { RegionConnection } from '../../../types';

export const DW_PALACE_OF_DARKNESS_CONNECTIONS: RegionConnection[] = [
  { from: 'east-dark-world', to: 'palace-of-darkness-entrance', entrance: 'Palace of Darkness', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'palace-of-darkness-entrance', to: 'palace-of-darkness-center', entrance: 'Palace of Darkness Bridge Room', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'palace-of-darkness-entrance', to: 'palace-of-darkness-bonk-section', entrance: 'Palace of Darkness Bonk Wall', tags: ['transit:bonk', 'dir:one-way', 'ctx:internal', 'barrier:dash'] },
  { from: 'palace-of-darkness-center', to: 'palace-of-darkness-big-key-chest', entrance: 'Palace of Darkness Big Key Chest Staircase', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'palace-of-darkness-center', to: 'palace-of-darkness-north', entrance: 'Palace of Darkness (North)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'palace-of-darkness-center', to: 'palace-of-darkness-maze', entrance: 'Palace of Darkness Big Key Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'palace-of-darkness-bonk-section', to: 'palace-of-darkness-center', entrance: 'Palace of Darkness Hammer Peg Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'palace-of-darkness-north', to: 'palace-of-darkness-harmless-hellway', entrance: 'Palace of Darkness Spike Statue Room Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'palace-of-darkness-north', to: 'palace-of-darkness-maze', entrance: 'Palace of Darkness Maze Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'palace-of-darkness-maze', to: 'palace-of-darkness-final-section', entrance: 'Palace of Darkness Final Section', tags: ['transit:stairs', 'dir:one-way', 'ctx:boss'] },
];
