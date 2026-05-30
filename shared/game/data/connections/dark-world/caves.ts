import type { ScreenConnection } from '../../../types';

export const DW_CAVE_CONNECTIONS: ScreenConnection[] = [
  // Hammer Peg Cave
  { from: 'hammer-peg-area', to: 'dark-world-hammer-peg-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance', 'barrier:hammer'] },

  // Bumper Cave
  { from: 'bumper-cave-entrance', to: 'bumper-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'bumper-cave-ledge', to: 'bumper-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Hype Cave
  { from: 'dw-34', to: 'hype-cave', tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'] },

  // Dark Lake Hylia Ledge Spike Cave
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-spike-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Spike Cave
  { from: 'dark-death-mountain-west-bottom', to: 'spike-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Hookshot Cave
  { from: 'dark-death-mountain-top', to: 'hookshot-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'hookshot-cave', to: 'hookshot-cave-upper', tags: ['transit:bonk', 'dir:one-way', 'ctx:internal', 'barrier:dash'] },
  { from: 'hookshot-cave-upper', to: 'hookshot-cave', tags: ['transit:hookshot', 'dir:one-way', 'ctx:internal', 'barrier:hookshot'] },
  { from: 'hookshot-cave-upper', to: 'death-mountain-floating-island-dw', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Mimic Cave (destination is LW cave but accessed from DW)
  { from: 'mimic-cave-ledge', to: 'mimic-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
