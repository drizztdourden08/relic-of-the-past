import type { RegionDefinition } from '../../types';

import { DARK_DEATH_MOUNTAIN_REGIONS } from './dark-death-mountain';
import { DARK_EAST_REGIONS } from './dark-east';
import { DARK_LAKE_HYLIA_REGIONS } from './dark-lake-hylia';
import { DARK_MIRE_REGIONS } from './dark-mire';
import { DARK_NORTH_REGIONS } from './dark-north';
import { DARK_SOUTH_REGIONS } from './dark-south';
import { SKULL_WOODS_AREA_REGIONS } from './skull-woods-area';
import { VILLAGE_OF_OUTCASTS_REGIONS } from './village-of-outcasts';

export { DARK_DEATH_MOUNTAIN_REGIONS } from './dark-death-mountain';
export { DARK_EAST_REGIONS } from './dark-east';
export { DARK_LAKE_HYLIA_REGIONS } from './dark-lake-hylia';
export { DARK_MIRE_REGIONS } from './dark-mire';
export { DARK_NORTH_REGIONS } from './dark-north';
export { DARK_SOUTH_REGIONS } from './dark-south';
export { SKULL_WOODS_AREA_REGIONS } from './skull-woods-area';
export { VILLAGE_OF_OUTCASTS_REGIONS } from './village-of-outcasts';

export const DARK_WORLD_OVERWORLD_REGIONS: RegionDefinition[] = [
  ...DARK_EAST_REGIONS,
  ...DARK_NORTH_REGIONS,
  ...DARK_SOUTH_REGIONS,
  ...VILLAGE_OF_OUTCASTS_REGIONS,
  ...SKULL_WOODS_AREA_REGIONS,
  ...DARK_MIRE_REGIONS,
  ...DARK_LAKE_HYLIA_REGIONS,
  ...DARK_DEATH_MOUNTAIN_REGIONS,
];
