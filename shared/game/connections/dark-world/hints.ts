import type { RegionConnection } from '../../types';

export const DW_HINT_CONNECTIONS: RegionConnection[] = [
  { from: 'dark-desert', to: 'dark-desert-hint', entrance: 'Dark Desert Hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'west-dark-world', to: 'fortune-teller-dark', entrance: 'Fortune Teller (Dark)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'west-dark-world', to: 'dark-sanctuary-hint', entrance: 'Dark Sanctuary Hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'east-dark-world', to: 'palace-of-darkness-hint', entrance: 'Palace of Darkness Hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'east-dark-world', to: 'east-dark-world-hint', entrance: 'East Dark World Hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-hint', entrance: 'Dark Lake Hylia Ledge Hint', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
