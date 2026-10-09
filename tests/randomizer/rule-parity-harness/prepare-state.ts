/* @layer tests @kind helper */
import type { Holding, World } from '@rotp/randomizer';
import { randomState } from './random-state';
import { scatterPlacements } from './scatter-placements';

type PrepareState = {
  world: World;
  items: readonly Holding[];
  random: () => number;
  index: number;
  actTokens: ReadonlySet<Holding> | null;
};

const prepareState = ({ world, items, random, index, actTokens }: PrepareState) => {
  if (index % 2 === 1) scatterPlacements(world, items, random);
  else world.placedItems.clear();
  if (actTokens !== null) {
    (world.options as { actTokens?: ReadonlySet<Holding> }).actTokens =
      new Set([...actTokens].filter(() => random() < 0.5));
  }
  return randomState(world, items, random);
};

export { prepareState };
