import type { RegionDefinition } from '../../types';

import { CENTRAL_HYRULE_REGIONS } from './central-hyrule';
import { DEATH_MOUNTAIN_REGIONS } from './death-mountain';
import { DESERT_REGIONS } from './desert';
import { EAST_HYRULE_REGIONS } from './east-hyrule';
import { HYRULE_CASTLE_REGIONS } from './hyrule-castle';
import { KAKARIKO_REGIONS } from './kakariko';
import { LAKE_HYLIA_REGIONS } from './lake-hylia';
import { LOST_WOODS_REGIONS } from './lost-woods';
import { SOUTH_HYRULE_REGIONS } from './south-hyrule';

export { CENTRAL_HYRULE_REGIONS } from './central-hyrule';
export { DEATH_MOUNTAIN_REGIONS } from './death-mountain';
export { DESERT_REGIONS } from './desert';
export { EAST_HYRULE_REGIONS } from './east-hyrule';
export { HYRULE_CASTLE_REGIONS } from './hyrule-castle';
export { KAKARIKO_REGIONS } from './kakariko';
export { LAKE_HYLIA_REGIONS } from './lake-hylia';
export { LOST_WOODS_REGIONS } from './lost-woods';
export { SOUTH_HYRULE_REGIONS } from './south-hyrule';

export const LIGHT_WORLD_OVERWORLD_REGIONS: RegionDefinition[] = [
  ...CENTRAL_HYRULE_REGIONS,
  ...KAKARIKO_REGIONS,
  ...DEATH_MOUNTAIN_REGIONS,
  ...LOST_WOODS_REGIONS,
  ...EAST_HYRULE_REGIONS,
  ...SOUTH_HYRULE_REGIONS,
  ...LAKE_HYLIA_REGIONS,
  ...DESERT_REGIONS,
  ...HYRULE_CASTLE_REGIONS,
];
