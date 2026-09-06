/* @layer renderer-lib @kind logic */
/**
 * The deliverable sets the live panels hand the pool: the capability probes'
 * own answers, the same sets generation uses, so what a panel shows is
 * exactly what the seed will carry.
 */
import {
  probeDeliverableCapacityLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '../../lib/game/randomizer-client';
import type { DeliverableSets } from '@shared/randomizer/ap-world/fill/fill-options-from-snapshot';

const deliverableSets = (): DeliverableSets => ({
  npc: probeDeliverableNpcLocations(),
  world: probeDeliverableWorldLocations(),
  capacity: probeDeliverableCapacityLocations(),
});

export { deliverableSets };
