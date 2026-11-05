/* @layer renderer-app @kind logic */
import { actTokensOf, worldFromPlacement } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';
import type { TrackerInput } from '@drizztdourden08/brock-randomizer/tracker';
import { doorsOf } from './rotp-tracker-assumed';

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

const rotpWorld = (input: TrackerInput<Placement>) =>
  worldFromPlacement(input.placement, doorsOf(input.assumed).darkRoomsNeedLight, actTokensOf(input.completed));

const rotpWorldKey = (input: TrackerInput<Placement>): string => {
  const tokens = [...actTokensOf(input.completed)].sort().join(',');
  return `${input.placement.seed}|${identityOf(input.placement)}|${doorsOf(input.assumed).darkRoomsNeedLight}|${tokens}`;
};

export { rotpWorld, rotpWorldKey };
