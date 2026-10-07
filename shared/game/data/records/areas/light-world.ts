/* @layer shared-game @kind data */

import type { AreaRecord } from '@shared/game/data/types';

const LW_AREAS: AreaRecord[] = [
  {
    id: 'area-001',
    world: 'light',
    name: 'Central Hyrule',
  },
  {
    id: 'area-011',
    world: 'light',
    name: 'Hyrule Castle',
  },
  {
    id: 'area-010',
    world: 'light',
    name: 'East Hyrule',
  },
  {
    id: 'area-016',
    world: 'light',
    name: 'South Hyrule',
  },
  {
    id: 'area-012',
    world: 'light',
    name: 'Kakariko',
  },
  {
    id: 'area-014',
    world: 'light',
    name: 'Lost Woods',
  },
  {
    id: 'area-008',
    world: 'both',
    name: 'Death Mountain',
  },
  {
    id: 'area-009',
    world: 'light',
    name: 'Desert',
  },
  {
    id: 'area-013',
    world: 'light',
    name: 'Lake Hylia',
  },
];

export { LW_AREAS };
