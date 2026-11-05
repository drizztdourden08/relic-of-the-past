/* @layer shared-game @kind logic */
import { actTokensOf } from '../world/events/event-gates';
import type { CollectionState } from '../world/collection-state';
import type { TrackerInput } from '@drizztdourden08/brock-randomizer/tracker';
import type { Placement } from '../world/fill/placement.type';

const primeActTokens = (state: unknown, input: TrackerInput<Placement>): void => {
  const target = state as CollectionState;
  for (const token of actTokensOf(input.completed)) target.collect(token);
};

export { primeActTokens };
