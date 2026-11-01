/* @layer shared-game @kind constants */
import { CAPACITY_POND } from '../pond-instances';
import { pondCertifiedSpotsOf } from './pond-certified-spots-of';
import type { LocationKey } from '../../location-key';

const POND_CERTIFIED_SPOTS: readonly LocationKey[] = pondCertifiedSpotsOf(CAPACITY_POND);

export { POND_CERTIFIED_SPOTS };
