import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_SKULL_WOODS_AREA_CONNECTIONS: RegionConnection[] = [
  { from: 'skull-woods-forest', to: 'skull-woods-forest-west', entrance: 'Skull Woods Forest (West)', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'skull-woods-forest', to: 'light-world', entrance: 'Skull Woods Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'skull-woods-forest', to: 'master-sword-meadow', entrance: 'Skull Woods Forest Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
