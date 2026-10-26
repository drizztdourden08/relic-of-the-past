/* @layer renderer-appshell @kind logic */
import type { CreateProfileOptions } from '@app/profiles/types';
import { deliverableListsOf } from '@rotp/randomizer';
import {
  probeDeliverablePondLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '@app/game/randomizer-client';

const withDeliverable = (opts: CreateProfileOptions): CreateProfileOptions => {
  const { randomizer } = opts;
  if (randomizer?.mode !== 'online' && randomizer?.mode !== 'archipelia') return opts;
  const deliverable = deliverableListsOf({
    npc: probeDeliverableNpcLocations(),
    capacity: probeDeliverablePondLocations(),
    world: probeDeliverableWorldLocations(),
  });
  return { ...opts, randomizer: { ...randomizer, deliverable } };
};

export { withDeliverable };
