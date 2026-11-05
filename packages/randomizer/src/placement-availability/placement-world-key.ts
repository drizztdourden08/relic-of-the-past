/* @layer shared-game @kind logic */
import { actTokensOf } from '../world/events/event-gates';
import { DARK_ROOMS_NEED_LIGHT } from './placement-reading.constants';
import type { TrackerInput } from '@drizztdourden08/brock-randomizer/tracker';
import type { Placement } from '../world/fill/placement.type';

const identities = new WeakMap<Placement, number>();
let nextIdentity = 1;

const identityOf = (placement: Placement): number => {
  let id = identities.get(placement);
  if (id === undefined) {
    id = nextIdentity;
    nextIdentity += 1;
    identities.set(placement, id);
  }
  return id;
};

const placementWorldKey = (input: TrackerInput<Placement>): string => {
  const tokens = [...actTokensOf(input.completed)].sort().join(',');
  return `${input.placement.seed}|${identityOf(input.placement)}|${input.assumed.has(DARK_ROOMS_NEED_LIGHT)}|${tokens}`;
};

export { placementWorldKey };
