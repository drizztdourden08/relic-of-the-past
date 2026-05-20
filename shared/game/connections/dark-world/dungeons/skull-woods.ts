import type { RegionConnection } from '../../../types';

export const DW_SKULL_WOODS_CONNECTIONS: RegionConnection[] = [
  // Entrances from forest
  { from: 'skull-woods-forest', to: 'skull-woods-first-section', entrance: 'Skull Woods First Section Door', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'skull-woods-forest', to: 'skull-woods-second-section-drop', entrance: 'Skull Woods Second Section Door (East)', tags: ['transit:hole', 'dir:one-way', 'ctx:dungeon-enter'] },
  { from: 'skull-woods-forest', to: 'skull-woods-second-section-drop', entrance: 'Skull Woods Second Section Door (West)', tags: ['transit:hole', 'dir:one-way', 'ctx:dungeon-enter'] },
  { from: 'skull-woods-forest-west', to: 'skull-woods-final-section-entrance', entrance: 'Skull Woods Final Section', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter', 'barrier:fire'] },

  // Internal
  { from: 'skull-woods-first-section', to: 'skull-woods-first-section-left', entrance: 'Skull Woods First Section South Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'skull-woods-first-section', to: 'skull-woods-first-section-left', entrance: 'Skull Woods First Section West Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'skull-woods-first-section-right', to: 'skull-woods-first-section', entrance: 'Skull Woods First Section (Right) North Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'skull-woods-first-section-left', to: 'skull-woods-first-section-right', entrance: 'Skull Woods First Section (Left) Door to Right', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'skull-woods-first-section-left', to: 'skull-woods-first-section', entrance: 'Skull Woods First Section (Left) Door to Exit', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'skull-woods-second-section-drop', to: 'skull-woods-second-section', entrance: 'Skull Woods Second Section (Drop)', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'skull-woods-final-section-entrance', to: 'skull-woods-final-section-mothula', entrance: 'Skull Woods Torch Room', tags: ['transit:door', 'dir:one-way', 'ctx:boss', 'barrier:fire'] },
  { from: 'skull-woods-first-section', to: 'skull-woods-first-section-top', entrance: 'Skull Woods First Section Bomb Jump', tags: ['transit:bomb', 'dir:one-way', 'ctx:internal', 'barrier:bomb'] },
];
