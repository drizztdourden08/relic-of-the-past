/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '../../world/location-key';
import { CAPACITY_UPGRADE_LOCATIONS } from '../../world/scope-tables';
import { lockedComplement } from './locked-complement';
import { probeDeliverablePondLocations } from './probe-deliverable-pond-locations';

const undeliverableCapacityLocations = (): ReadonlySet<LocationKey> =>
  lockedComplement(CAPACITY_UPGRADE_LOCATIONS, probeDeliverablePondLocations());

export { undeliverableCapacityLocations };
