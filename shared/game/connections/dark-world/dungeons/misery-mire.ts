import type { RegionConnection } from '../../../types';

export const DW_MISERY_MIRE_CONNECTIONS: RegionConnection[] = [
  { from: 'dark-desert', to: 'misery-mire-entrance', entrance: 'Misery Mire', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter', 'barrier:medallion'] },
  { from: 'misery-mire-entrance', to: 'misery-mire-main', entrance: 'Misery Mire Entrance Gap', tags: ['transit:hookshot', 'dir:two-way', 'ctx:internal', 'barrier:hookshot'] },
  { from: 'misery-mire-main', to: 'misery-mire-west', entrance: 'Misery Mire (West)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'misery-mire-main', to: 'misery-mire-final-area', entrance: 'Misery Mire Big Key Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'misery-mire-final-area', to: 'misery-mire-vitreous', entrance: 'Misery Mire (Vitreous)', tags: ['transit:door', 'dir:one-way', 'ctx:boss'] },
];
