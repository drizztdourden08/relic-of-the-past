import type { RegionConnection } from '../../../types';

export const DW_GANONS_TOWER_CONNECTIONS: RegionConnection[] = [
  { from: 'dark-death-mountain-top', to: 'ganons-tower-entrance', entrance: 'Ganons Tower', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter', 'barrier:crystals'] },
  { from: 'ganons-tower-entrance', to: 'ganons-tower-tile-room', entrance: 'Ganons Tower (Tile Room)', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ganons-tower-entrance', to: 'ganons-tower-hookshot-room', entrance: 'Ganons Tower (Hookshot Room)', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ganons-tower-entrance', to: 'ganons-tower-bottom', entrance: 'Ganons Tower Big Key Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:big-key'] },
  { from: 'ganons-tower-tile-room', to: 'ganons-tower-compass-room', entrance: 'Ganons Tower (Tile Room) Key Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'ganons-tower-compass-room', to: 'ganons-tower-bottom', entrance: 'Ganons Tower (Bottom) (East)', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ganons-tower-hookshot-room', to: 'ganons-tower-map-room', entrance: 'Ganons Tower (Map Room)', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'ganons-tower-hookshot-room', to: 'ganons-tower-firesnake-room', entrance: 'Ganons Tower (Double Switch Room)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'ganons-tower-firesnake-room', to: 'ganons-tower-teleport-room', entrance: 'Ganons Tower (Firesnake Room)', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'ganons-tower-teleport-room', to: 'ganons-tower-bottom', entrance: 'Ganons Tower (Bottom) (West)', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
  { from: 'ganons-tower-bottom', to: 'ganons-tower-top', entrance: 'Ganons Tower (Top)', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'ganons-tower-top', to: 'ganons-tower-before-moldorm', entrance: 'Ganons Tower Torch Rooms', tags: ['transit:door', 'dir:one-way', 'ctx:internal', 'barrier:fire'] },
  { from: 'ganons-tower-before-moldorm', to: 'ganons-tower-moldorm', entrance: 'Ganons Tower Moldorm Door', tags: ['transit:door', 'dir:one-way', 'ctx:internal', 'barrier:small-key'] },
  { from: 'ganons-tower-moldorm', to: 'agahnim-2', entrance: 'Ganons Tower Moldorm Gap', tags: ['transit:hookshot', 'dir:one-way', 'ctx:boss', 'barrier:hookshot'] },
];
