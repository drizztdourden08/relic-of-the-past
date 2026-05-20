import type { RegionConnection } from '../../types';

export const DW_CAVE_CONNECTIONS: RegionConnection[] = [
  // Hammer Peg Cave
  { from: 'hammer-peg-area', to: 'dark-world-hammer-peg-cave', entrance: 'Dark World Hammer Peg Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance', 'barrier:hammer'] },

  // Bumper Cave
  { from: 'bumper-cave-entrance', to: 'bumper-cave', entrance: 'Bumper Cave (Bottom)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'bumper-cave-ledge', to: 'bumper-cave', entrance: 'Bumper Cave (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Hype Cave
  { from: 'dw-34', to: 'hype-cave', entrance: 'Hype Cave', tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'] },

  // Dark Lake Hylia Ledge Spike Cave
  { from: 'dark-lake-hylia-ledge', to: 'dark-lake-hylia-ledge-spike-cave', entrance: 'Dark Lake Hylia Ledge Spike Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Spike Cave
  { from: 'dark-death-mountain-west-bottom', to: 'spike-cave', entrance: 'Spike Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Hookshot Cave
  { from: 'dark-death-mountain-top', to: 'hookshot-cave', entrance: 'Hookshot Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'hookshot-cave', to: 'hookshot-cave-upper', entrance: 'Hookshot Cave Bonk Path', tags: ['transit:bonk', 'dir:one-way', 'ctx:internal', 'barrier:dash'] },
  { from: 'hookshot-cave-upper', to: 'hookshot-cave', entrance: 'Hookshot Cave Hook Path', tags: ['transit:hookshot', 'dir:one-way', 'ctx:internal', 'barrier:hookshot'] },
  { from: 'hookshot-cave-upper', to: 'death-mountain-floating-island-dw', entrance: 'Hookshot Cave Back Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Mimic Cave (destination is LW cave but accessed from DW)
  { from: 'mimic-cave-ledge', to: 'mimic-cave', entrance: 'Mimic Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
];
