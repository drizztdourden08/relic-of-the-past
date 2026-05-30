import type { ScreenConnection } from '../../../../types';

export const DW_OVERWORLD_DARK_MIRE_CONNECTIONS: ScreenConnection[] = [
  // Mirror spots
  { from: 'dark-desert', to: 'desert-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-desert', to: 'desert-northern-cliffs', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'dark-desert', to: 'desert-palace-lone-stairs', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
