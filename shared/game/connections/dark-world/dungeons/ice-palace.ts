import type { RegionConnection } from '../../../types';

export const DW_ICE_PALACE_CONNECTIONS: RegionConnection[] = [
  { from: 'dark-lake-hylia-central-island', to: 'ice-palace-entrance', entrance: 'Ice Palace', tags: ['transit:door', 'dir:two-way', 'ctx:dungeon-enter'] },
  { from: 'ice-palace-entrance', to: 'ice-palace-second-section', entrance: 'Ice Palace (Second Section)', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'ice-palace-second-section', to: 'ice-palace-main', entrance: 'Ice Palace (Main)', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal', 'barrier:bomb'] },
  { from: 'ice-palace-main', to: 'ice-palace-east', entrance: 'Ice Palace (East)', tags: ['transit:door', 'dir:two-way', 'ctx:internal'] },
  { from: 'ice-palace-main', to: 'ice-palace-kholdstare', entrance: 'Ice Palace (Kholdstare)', tags: ['transit:door', 'dir:one-way', 'ctx:boss', 'barrier:big-key'] },
  { from: 'ice-palace-east', to: 'ice-palace-east-top', entrance: 'Ice Palace (East Top)', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
];
