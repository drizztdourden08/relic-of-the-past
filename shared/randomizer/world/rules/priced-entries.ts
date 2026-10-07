/* @layer shared-game @kind logic */
/**
 * Every priced check and passage, read off the records that carry a price.
 *
 * The reference generator assumes an unbounded, farmable wallet and carries no price rows at
 * all; with a wallet ladder that can start at 0 a price is a real gate, so each record's own
 * vanilla price is AND-composed onto the reference rules (prices.ts). A wallet must HOLD the
 * price at once.
 *
 * A SHELF IS LEFT OUT on purpose. A shop slot carries a price like any other record, but the
 * shop overlay applies it, because a seed may have rolled a different price and a different
 * currency for that slot and the shelf then charges what was rolled (prices.ts,
 * registerShopPriceRules). Keeping shelves out also keeps MAX_PRICE meaning the dearest gate
 * on the way to the goal.
 */
import { all } from '@shared/game/data';
import type { RuleTargetKind } from './rule-entry.type';

interface PricedEntry {
  kind: RuleTargetKind;
  /** An exit's own name, or a location's key. */
  target: string;
  price: number;
}

/**
 * The priced target no record covers: the cursed fairy's passage, which is an exit and never a
 * location at all. It takes the price the reference's shop table lists for a fairy slot. The
 * capacity fairy's own price is read where her shop is (capacity/capacity-shop.data.ts).
 */
const PRICED_WITHOUT_RECORDS: readonly PricedEntry[] = [
  { kind: 'exit', target: 'Pyramid Fairy', price: 100 },
];

const PRICED_ENTRIES: readonly PricedEntry[] = [
  ...all('check')
    .filter((check) => check.price !== undefined && check.kind !== 'shop-slot')
    .map((check): PricedEntry => ({
      kind: 'location', target: check.id, price: check.price ?? 0,
    })),
  ...PRICED_WITHOUT_RECORDS,
];

/** The priciest gate on the way to the goal: the wallet rung the fill must be able to reach. */
const MAX_PRICE = Math.max(...PRICED_ENTRIES.map((entry) => entry.price));

export { MAX_PRICE, PRICED_ENTRIES };
export type { PricedEntry };
