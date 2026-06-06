import type { ScreenConnection } from '../../../types';

const LW_HOUSE_CONNECTIONS: ScreenConnection[] = [
  // Kakariko houses (all on lw-18: Kakariko NW)
  { from: 'lw-18', to: 'blinds-hideout', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'elder-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'snitch-lady-east', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'snitch-lady-west', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'bush-covered-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'tavern-front', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'light-world-bomb-hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'tavern', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'chicken-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-18', to: 'sick-kids-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-22', to: 'blacksmiths-hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-29', to: 'library', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Links House (on lw-2c: Uncle's Estate East)
  { from: 'lw-2c', to: 'links-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'links-house', to: 'lw-2c', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Links House — intro variant (passage to Secret Passage / Uncle)
  { from: 'links-house--intro', to: 'hyrule-castle-secret-passage', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },

  // Central / South
  { from: 'lw-3b', to: 'dam', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-1e', to: 'sahasrahlas-hut', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-02', to: 'lumberjack-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Death Mountain
  { from: 'death-mountain', to: 'old-man-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'old-man-house', to: 'old-man-house-back', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'old-man-house-back', to: 'death-mountain-return-ledge', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Two Brothers House (passage between overworld areas)
  { from: 'lw-28', to: 'two-brothers-house', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'two-brothers-house', to: 'maze-race-ledge', tags: ['transit:door', 'dir:one-way', 'ctx:exit'] },
];

export { LW_HOUSE_CONNECTIONS };
