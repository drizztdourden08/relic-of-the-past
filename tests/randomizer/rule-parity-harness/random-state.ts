/* @layer tests @kind helper */
import { createCollectionState } from '@shared/randomizer/world/collection-state';
import type { Holding } from '@shared/randomizer/world/collection-state';
import type { World } from '@shared/randomizer/world/world.type';

const randomState = (world: World, items: readonly Holding[], random: () => number) => {
  const state = createCollectionState(world);
  const density = random();
  for (const item of items) {
    if (random() >= density * 0.7) continue;
    state.collect(item);
    if (random() < density * 0.4) state.collect(item);
    if (random() < density * 0.2) state.collect(item);
  }
  return state;
};

export { randomState };
