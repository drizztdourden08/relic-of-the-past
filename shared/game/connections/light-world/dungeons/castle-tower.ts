import type { RegionConnection } from '../../../types';

export const LW_CASTLE_TOWER_CONNECTIONS: RegionConnection[] = [
  { from: 'overworld', to: 'ct-0xe0', entrance: 'Tower Entrance', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'ct-0x20', to: 'ct-0x30', entrance: 'Descent Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0x30', to: 'ct-0x40', entrance: 'Descent Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0x40', to: 'ct-0xb0', entrance: 'Descent Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0xb0', to: 'ct-0xc0', entrance: 'Descent Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0xc0', to: 'ct-0xd0', entrance: 'Descent Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0xd0', to: 'ct-0xe0', entrance: 'Ground Floor Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ct-0x20', to: 'ct-0x30', entrance: 'Drop from Roof', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'ct-0xe0', to: 'lw-1b', entrance: 'Tower Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'ct-0x20', to: 'lw-1b', entrance: 'Agahnim Defeat Warp', tags: ['transit:warp', 'dir:one-way', 'ctx:exit'] },
  { from: 'ct-0xe0', to: 'ct-0xd0', entrance: 'Ascent Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
];
