/* @layer shared-game @kind logic */
import { REGION } from '../../region-ids.data';
import { BOTTLE_ITEMS } from '../../item-groups';
import { POTION_CAULDRONS } from '../../potion-price/potion-cauldrons.constants';
import { FALSE, TRUE, all, countGroup, helper, region, seedIs, seedRef, when } from '../rule-node-build';
import { HAS_ANY_BOTTLE } from '../bottle-nodes.constants';
import { priceField } from './price-field';
import type { RuleNode } from '../rule-node.type';

const seededBottleNode = (prefix: string): RuleNode => {
  const vessels = when(
    seedIs(priceField.overLimit(prefix), true), FALSE, countGroup(BOTTLE_ITEMS, seedRef(priceField.count(prefix))),
  );
  const seller = POTION_CAULDRONS.reduceRight<RuleNode>(
    (otherwise, cauldron) => when(
      seedIs(priceField.content(prefix), cauldron.content),
      all(region(REGION.potionSeller), helper('walletAtLeast', cauldron.price)),
      otherwise,
    ),
    TRUE,
  );
  return all(HAS_ANY_BOTTLE, vessels, seller);
};

export { seededBottleNode };
