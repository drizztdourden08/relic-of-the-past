/* @layer renderer-app @kind logic */
import { actTokensOf } from '@rotp/randomizer';
import type { CollectionState, Placement } from '@rotp/randomizer';
import type { TrackerInput } from '@drizztdourden08/brock-randomizer/tracker';

const rotpPrime = (state: unknown, input: TrackerInput<Placement>): void => {
  const target = state as CollectionState;
  for (const token of actTokensOf(input.completed)) target.collect(token);
};

export { rotpPrime };
