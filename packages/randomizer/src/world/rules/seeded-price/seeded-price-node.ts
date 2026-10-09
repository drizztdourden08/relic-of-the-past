/* @layer shared-game @kind logic */
import { TRUE, helper, seedIs, seedRef, when } from '../rule-node-build';
import { COUNTED_CURRENCY_HELPERS } from './seeded-price.constants';
import { priceField } from './price-field';
import { seededBottleNode } from './seeded-bottle-node';
import type { RuleNode } from '../rule-node.type';

const seededPriceNode = (prefix: string): RuleNode => {
  const currency = priceField.currency(prefix);
  return COUNTED_CURRENCY_HELPERS.reduceRight<RuleNode>(
    (otherwise, [name, helperName]) =>
      when(seedIs(currency, name), helper(helperName, seedRef(priceField.amount(prefix))), otherwise),
    when(
      seedIs(currency, 'item'),
      { op: 'has', item: seedRef(priceField.item(prefix)) },
      when(seedIs(currency, 'bottle'), seededBottleNode(prefix), TRUE),
    ),
  );
};

export { seededPriceNode };
