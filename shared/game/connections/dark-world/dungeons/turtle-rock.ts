import type { RegionConnection } from '../../../types';

export const DW_TURTLE_ROCK_CONNECTIONS: RegionConnection[] = [
  { from: 'turtle-rock-entrance', to: 'turtle-rock-first-section', entrance: 'Turtle Rock Entrance Gap', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'turtle-rock-first-section', to: 'turtle-rock-entrance', entrance: 'Turtle Rock Entrance Gap Reverse', tags: ['transit:walk', 'dir:two-way', 'ctx:internal'] },
  { from: 'turtle-rock-first-section', to: 'turtle-rock-pokey-room', entrance: 'Turtle Rock Entrance to Pokey Room', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'turtle-rock-pokey-room', to: 'turtle-rock-chain-chomp-room', entrance: 'Turtle Rock (Pokey Room) (North)', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'turtle-rock-pokey-room', to: 'turtle-rock-second-section', entrance: 'Turtle Rock (Pokey Room) (South)', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'turtle-rock-chain-chomp-room', to: 'turtle-rock-first-section', entrance: 'Turtle Rock (Chain Chomp Room) (North)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'turtle-rock-chain-chomp-room', to: 'turtle-rock-second-section', entrance: 'Turtle Rock (Chain Chomp Room) (South)', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'turtle-rock-second-section', to: 'turtle-rock-crystaroller-room', entrance: 'Turtle Rock Chain Chomp Staircase', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'turtle-rock-second-section', to: 'turtle-rock-big-chest', entrance: 'Turtle Rock Big Key Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'turtle-rock-second-section', to: 'turtle-rock-second-section-bomb-wall', entrance: 'Turtle Rock Second Section Bomb Wall', tags: ['transit:bomb', 'dir:one-way', 'ctx:internal', 'barrier:bomb'] },
  { from: 'turtle-rock-second-section-bomb-wall', to: 'turtle-rock-second-section', entrance: 'Turtle Rock Second Section from Bomb Wall', tags: ['transit:walk', 'dir:one-way', 'ctx:internal'] },
  { from: 'turtle-rock-crystaroller-room', to: 'turtle-rock-dark-room', entrance: 'Turtle Rock Dark Room Staircase', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'turtle-rock-crystaroller-room', to: 'turtle-rock-second-section', entrance: 'Turtle Rock Big Key Door Reverse', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'turtle-rock-dark-room', to: 'turtle-rock-first-section', entrance: 'Turtle Rock (Dark Room) (North)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:dark'] },
  { from: 'turtle-rock-dark-room', to: 'turtle-rock-eye-bridge', entrance: 'Turtle Rock (Dark Room) (South)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'turtle-rock-eye-bridge', to: 'turtle-rock-dark-room', entrance: 'Turtle Rock Dark Room (South)', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'turtle-rock-eye-bridge', to: 'turtle-rock-trinexx', entrance: 'Turtle Rock (Trinexx)', tags: ['transit:door', 'dir:one-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'turtle-rock-eye-bridge', to: 'turtle-rock-eye-bridge-bomb-wall', entrance: 'Turtle Rock Eye Bridge Bomb Wall', tags: ['transit:bomb', 'dir:one-way', 'ctx:internal', 'barrier:bomb'] },
  { from: 'turtle-rock-eye-bridge-bomb-wall', to: 'turtle-rock-eye-bridge', entrance: 'Turtle Rock Eye Bridge from Bomb Wall', tags: ['transit:walk', 'dir:one-way', 'ctx:internal'] },
];
