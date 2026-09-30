/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { AreaRecord } from '@shared/game/data/types';

const AREAS: AreaRecord[] = [
  {
    id: 'area-001',
    world: 'light',
    randomizerName: 'Central Hyrule',
  },
  {
    id: 'area-011',
    world: 'light',
    randomizerName: 'Hyrule Castle',
  },
  {
    id: 'area-010',
    world: 'light',
    randomizerName: 'East Hyrule',
  },
  {
    id: 'area-016',
    world: 'light',
    randomizerName: 'South Hyrule',
  },
  {
    id: 'area-012',
    world: 'light',
    randomizerName: 'Kakariko',
  },
  {
    id: 'area-014',
    world: 'light',
    randomizerName: 'Lost Woods',
  },
  {
    id: 'area-008',
    world: 'both',
    randomizerName: 'Death Mountain',
  },
  {
    id: 'area-009',
    world: 'light',
    randomizerName: 'Desert',
  },
  {
    id: 'area-013',
    world: 'light',
    randomizerName: 'Lake Hylia',
  },
  {
    id: 'area-006',
    world: 'dark',
    randomizerName: 'Dark North',
  },
  {
    id: 'area-003',
    world: 'dark',
    randomizerName: 'Dark East',
  },
  {
    id: 'area-007',
    world: 'dark',
    randomizerName: 'Dark South',
  },
  {
    id: 'area-005',
    world: 'dark',
    randomizerName: 'Dark Mire',
  },
  {
    id: 'area-004',
    world: 'dark',
    randomizerName: 'Dark Lake Hylia',
  },
  {
    id: 'area-002',
    world: 'dark',
    randomizerName: 'Dark Death Mountain',
  },
  {
    id: 'area-015',
    world: 'dark',
    randomizerName: 'Skull Woods Area',
  },
  {
    id: 'area-017',
    world: 'dark',
    randomizerName: 'Village Of Outcasts',
  },
];

export { AREAS };
