/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../types';

const LW_FAIRY_CONNECTIONS: ScreenConnection[] = [
  { from: 'lw-14', to: 'bonk-fairy-light', tags: ['transit:bonk', 'dir:two-way', 'ctx:entrance', 'barrier:dash'] },
  { from: 'lake-hylia-central-island', to: 'capacity-upgrade', tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-0f', to: 'waterfall-of-wishing', tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance', 'barrier:swim'] },
  { from: 'zoras-river', to: 'waterfall-of-wishing', tags: ['transit:waterfall', 'dir:two-way', 'ctx:entrance', 'barrier:swim'] },
  { from: 'lw-12', to: 'north-fairy-cave', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'north-fairy-cave', to: 'lw-12', tags: ['transit:door', 'dir:one-way', 'ctx:exit'] },
  { from: 'lw-35', to: 'lake-hylia-healer-fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-3c', to: 'swamp-healer-fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-30', to: 'desert-healer-fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-34', to: 'long-fairy-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'east-death-mountain-bottom', to: 'hookshot-fairy', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];

export { LW_FAIRY_CONNECTIONS };
