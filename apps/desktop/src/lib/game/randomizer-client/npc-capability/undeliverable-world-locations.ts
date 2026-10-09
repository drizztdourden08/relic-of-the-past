/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { WORLD_ITEM_SCOPE_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import { lockedComplement } from './locked-complement';
import { probeDeliverableWorldLocations } from './probe-deliverable-world-locations';

const undeliverableWorldLocations = (): ReadonlySet<LocationKey> =>
  lockedComplement(WORLD_ITEM_SCOPE_LOCATIONS, probeDeliverableWorldLocations());

export { undeliverableWorldLocations };
