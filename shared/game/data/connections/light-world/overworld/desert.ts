/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../../types';

const LW_OVERWORLD_DESERT_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-38', to: 'desert-palace-stairs', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'desert-palace-stairs', to: 'desert-palace-entrance-north-spot', tags: ['transit:stairs', 'dir:one-way', 'ctx:overworld', 'barrier:book'] },
  { from: 'desert-palace-stairs', to: 'lw-38', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'desert-ledge', to: 'lw-38', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'desert-ledge-northeast', to: 'desert-ledge', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'desert-palace-lone-stairs', to: 'desert-ledge', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'desert-northern-cliffs', to: 'desert-ledge-northeast', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
];

export { LW_OVERWORLD_DESERT_CONNECTIONS };
