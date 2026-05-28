import type { RegionConnection } from '../../types';

export const DW_PASSAGE_CONNECTIONS: RegionConnection[] = [
  // Superbunny Cave (connects dark death mountain top ↔ bottom)
  { from: 'east-death-mountain-top', to: 'superbunny-cave-top', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-top', to: 'superbunny-cave-top', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'dark-death-mountain-east-bottom', to: 'superbunny-cave-bottom', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'superbunny-cave-top', to: 'superbunny-cave-bottom', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'superbunny-cave-bottom', to: 'east-death-mountain-bottom', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
];
