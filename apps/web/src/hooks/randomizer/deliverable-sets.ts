/* @layer renderer-lib @kind logic */
import {
  probeDeliverablePondLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '../../lib/game/randomizer-client';
import type { DeliverableSets } from '@shared/randomizer/world/fill/fill-options-from-snapshot';

const deliverableSets = (): DeliverableSets => ({
  npc: probeDeliverableNpcLocations(),
  world: probeDeliverableWorldLocations(),
  capacity: probeDeliverablePondLocations(),
});

export { deliverableSets };
