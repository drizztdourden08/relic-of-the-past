/* @layer shared-game @kind constants */
import { CAPACITY_POND } from '../pond-instances';
import { POND_EXTRA_LOCATIONS } from '../pond-rungs';
import { pondCertifiedSpotsOf } from './pond-certified-spots-of';
import type { LocationKey } from '../../location-key';

const POND_EXTRA_SET: ReadonlySet<LocationKey> = new Set(POND_EXTRA_LOCATIONS);

const POND_CERTIFIED_SPOTS: readonly LocationKey[] = pondCertifiedSpotsOf(CAPACITY_POND);

export { POND_CERTIFIED_SPOTS, POND_EXTRA_SET };
