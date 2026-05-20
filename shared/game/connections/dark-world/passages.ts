import type { RegionConnection } from '../../types';

export const DW_PASSAGE_CONNECTIONS: RegionConnection[] = [
  // Superbunny Cave (connects dark death mountain top ↔ bottom)
  { from: 'east-death-mountain-top', to: 'superbunny-cave-top', entrance: 'Superbunny Cave (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-top', to: 'superbunny-cave-top', entrance: 'Superbunny Cave (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-east-bottom', to: 'superbunny-cave-bottom', entrance: 'Superbunny Cave (Bottom)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'superbunny-cave-top', to: 'superbunny-cave-bottom', entrance: 'Superbunny Cave Descent', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'superbunny-cave-bottom', to: 'east-death-mountain-bottom', entrance: 'Superbunny Cave Exit (Bottom)', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
