/* @layer shared-game @kind constants */
import { POND_INSTANCES } from '../pond-instances';
import { regionOfPond } from './region-of-pond';
import { locationsOfPond } from './locations-of-pond';
import type { RegionId } from '@rotp/game-data';
import type { LocationKey } from '../../location-key';

const POND_REGION_LOCATIONS: ReadonlyMap<RegionId, readonly LocationKey[]> = new Map(
  POND_INSTANCES.map((pond) => [regionOfPond(pond), locationsOfPond(pond)]),
);

export { POND_REGION_LOCATIONS };
