/* @layer renderer-lib @kind logic */
import {
  probeDeliverablePondLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '../../game/randomizer-client';
import type { DeliverableSets } from '@rotp/randomizer';

const deliverableSets = (): DeliverableSets => ({
  npc: probeDeliverableNpcLocations(),
  world: probeDeliverableWorldLocations(),
  capacity: probeDeliverablePondLocations(),
});

export { deliverableSets };
