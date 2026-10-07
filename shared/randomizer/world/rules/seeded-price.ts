/* @layer shared-game @kind logic */
/**
 * A price as a SEEDED tree: the rule shop-prices.ts writes for one price, with the price itself
 * read off the world's seed table (seed-values.ts) instead of written into the tree. The tree
 * branches on the currency the table holds and reads the amount, the item or the bottle content
 * from it, so one tree stands for every price a seed may roll, and a `none` currency asks
 * nothing, which is what a slot with no price reads as.
 *
 * Each branch is the literal rule priceNode writes for that currency, so a table holding the
 * price P answers exactly as priceNode(P) does.
 */
import { REGION } from '../region-ids.data';
import { BOTTLE_ITEMS } from '../item-groups';
import { POTION_CAULDRONS } from '../potion-price/potion-cauldrons.data';
import {
  FALSE, TRUE, all, any, countGroup, has, helper, region, seedIs, seedRef, when,
} from './rule-node-build';
import type { LocationKey } from '../location-key';
import type { HelperName, RuleNode } from './rule-node.type';

/** The seed-table names this game's seeded rules read (seed-values.ts says what each holds). */
const seedKey = {
  shopPrice: (slot: LocationKey): string => `shopPrice:${slot}`,
  pondPrice: (slot: LocationKey): string => `pondPrice:${slot}`,
  pondDemand: (rung: LocationKey): string => `pondDemand:${rung}`,
  pondGated: (rung: LocationKey): string => `pondGated:${rung}`,
} as const;

/** The fields one price spreads over in the seed table, each under the price's own prefix. */
const priceField = {
  currency: (prefix: string): string => `${prefix}.currency`,
  amount: (prefix: string): string => `${prefix}.amount`,
  item: (prefix: string): string => `${prefix}.item`,
  count: (prefix: string): string => `${prefix}.count`,
  overLimit: (prefix: string): string => `${prefix}.overLimit`,
  content: (prefix: string): string => `${prefix}.content`,
} as const;

/** The counted currencies, each read by the helper its capacity answers to. */
const COUNTED: readonly (readonly [string, HelperName])[] = [
  ['rupees', 'walletAtLeast'],
  ['arrows', 'projectilesAtLeast'],
  ['bombs', 'explosivesAtLeast'],
  ['hearts', 'heartCapacityAbove'],
];

const hasAnyBottle: RuleNode = any(...BOTTLE_ITEMS.map((bottle) => has(bottle)));

/** The bottle branch: the vessels, then the seller of a content that is bought. */
const bottleNode = (prefix: string): RuleNode => {
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
  return all(hasAnyBottle, vessels, seller);
};

/** What paying the price the table holds under `prefix` asks, as one tree for every price. */
const seededPriceNode = (prefix: string): RuleNode => {
  const currency = priceField.currency(prefix);
  return COUNTED.reduceRight<RuleNode>(
    (otherwise, [name, helperName]) =>
      when(seedIs(currency, name), helper(helperName, seedRef(priceField.amount(prefix))), otherwise),
    when(
      seedIs(currency, 'item'),
      { op: 'has', item: seedRef(priceField.item(prefix)) },
      when(seedIs(currency, 'bottle'), bottleNode(prefix), TRUE),
    ),
  );
};

export { priceField, seedKey, seededPriceNode };
