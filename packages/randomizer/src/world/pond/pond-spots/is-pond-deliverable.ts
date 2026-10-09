/* @layer shared-game @kind logic */
import { CAPACITY_POND } from '../pond-instances';
import { pondCertifiedSpotsOf } from './pond-certified-spots-of';
import type { LocationKey } from '../../location-key';
import type { PondInstance } from '../pond-instance.type';

const isPondDeliverable = (
  deliverable: ReadonlySet<LocationKey> | undefined, pond: PondInstance = CAPACITY_POND,
): boolean => pondCertifiedSpotsOf(pond).every((name) => deliverable?.has(name) === true);

export { isPondDeliverable };
