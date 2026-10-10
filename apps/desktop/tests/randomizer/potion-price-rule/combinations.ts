/* @layer tests @kind helper */
import { SHOP_SHUFFLE_MODES } from '@rotp/randomizer';
import { ALL_PRICES, NO_CONTENTS } from './potion-price-rule.constants';
import type { Combination } from './potion-price-rule.type';
import { cauldronSubsets } from './cauldron-subsets';
import { scopeWith } from './scope-with';

const combinations = (): Combination[] => {
  const all: Combination[] = [];
  for (const mode of SHOP_SHUFFLE_MODES) {
    for (const ticked of cauldronSubsets()) {
      for (const prices of [ALL_PRICES, NO_CONTENTS]) all.push({ scope: scopeWith(ticked, mode), prices });
    }
  }
  return all;
};

export { combinations };
