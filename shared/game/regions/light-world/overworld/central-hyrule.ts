import type { RegionDefinition } from '../../types';

export const CENTRAL_HYRULE_REGIONS: RegionDefinition[] = [
  { id: 'menu', name: 'Menu', type: 'lightWorld', tags: ['world:light', 'type:special', 'role:spawn_point'] },
  { id: 'light-world', name: 'Light World', type: 'lightWorld', tags: ['world:light', 'env:outside', 'type:overworld', 'area:central_hyrule', 'role:hub'] },
  { id: 'light-world-rain', name: 'Light World (Rain)', type: 'lightWorld', tags: ['world:light', 'env:outside', 'type:overworld', 'area:central_hyrule', 'type:special'] },
];
