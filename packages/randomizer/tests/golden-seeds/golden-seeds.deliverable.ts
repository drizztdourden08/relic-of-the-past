/* @layer tests @kind constants */
import { POND_INSTANCES, pondCertifiedSpotsOf } from '@rotp/randomizer';
import type { DeliverableSets, LocationKey } from '@rotp/randomizer';

const NONE: ReadonlySet<LocationKey> = new Set();
const EVERY_POND_SPOT: ReadonlySet<LocationKey> = new Set(POND_INSTANCES.flatMap(pondCertifiedSpotsOf));
const POND_SPOTS_ONLY: DeliverableSets = { npc: NONE, capacity: EVERY_POND_SPOT, world: NONE };
const NPC_AND_WORLD_SPOTS: DeliverableSets = {
  npc: new Set<LocationKey>(['check-019', 'check-033', 'check-060', 'check-121']),
  world: new Set<LocationKey>(['check-055', 'check-080', 'check-126', 'check-009']),
};

export { NPC_AND_WORLD_SPOTS, POND_SPOTS_ONLY };
