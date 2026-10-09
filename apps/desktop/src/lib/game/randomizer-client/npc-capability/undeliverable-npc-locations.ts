/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { NPC_SCOPE_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import { lockedComplement } from './locked-complement';
import { probeDeliverableNpcLocations } from './probe-deliverable-npc-locations';

const undeliverableNpcLocations = (): ReadonlySet<LocationKey> =>
  lockedComplement(NPC_SCOPE_LOCATIONS, probeDeliverableNpcLocations());

export { undeliverableNpcLocations };
