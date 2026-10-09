/* @layer shared-game @kind constants */
import { POND_INSTANCES } from '../pond-instances';
import { pondRungsOf } from './pond-rungs-of';
import type { LocationKey } from '../../location-key';
import type { PondId } from '../pond-instance.type';

const POND_RUNGS_BY_ID: Readonly<Record<PondId, readonly LocationKey[]>> = Object.fromEntries(
  POND_INSTANCES.map((pond) => [pond.id, pondRungsOf(pond)]),
) as Readonly<Record<PondId, readonly LocationKey[]>>;

const POND_PRIZE_LOCATIONS: readonly LocationKey[] = POND_RUNGS_BY_ID.capacity;

const POND_EXTRA_LOCATIONS: readonly LocationKey[] = POND_INSTANCES
  .flatMap((pond) => POND_RUNGS_BY_ID[pond.id]);

const POND_LOCATION_SET: ReadonlySet<LocationKey> = new Set(POND_EXTRA_LOCATIONS);

export { POND_EXTRA_LOCATIONS, POND_LOCATION_SET, POND_PRIZE_LOCATIONS, POND_RUNGS_BY_ID };
