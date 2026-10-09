/* @layer shared-game @kind logic */
import { REGION } from '../../region-ids.constants';
import { BASELINE } from '../../state-helpers';
import { BOTTLE_ITEMS } from '../../item-groups';
import { cauldronPriceOf } from '../../potion-price/cauldron-price-of';
import { FALSE, all, countGroup, helper, region } from '../rule-node-build';
import { HAS_ANY_BOTTLE } from '../bottle-nodes.constants';
import type { RuleNode } from '../rule-node.type';

const bottlesAtLeast = (count: number): RuleNode =>
  (count > BASELINE.progressiveBottleLimit ? FALSE : countGroup(BOTTLE_ITEMS, count));

const hasBottles = (count: number): RuleNode => all(HAS_ANY_BOTTLE, bottlesAtLeast(count));

const shopBottleNode = (content: string, count: number): RuleNode => {
  const price = cauldronPriceOf(content);
  if (price === undefined) return hasBottles(count);
  return all(hasBottles(count), region(REGION.potionSeller), helper('walletAtLeast', price));
};

export { shopBottleNode };
