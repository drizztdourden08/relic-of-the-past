/* @layer shared-game @kind data */
/**
 * Rupee prices of the checks and passages that charge the player. The
 * reference generator assumes an unbounded, farmable wallet and carries no
 * price rows at all; with a wallet ladder that can start at 0 a price is a
 * real gate, so these vanilla prices are AND-composed onto the reference
 * rules (rules/prices.ts). The pond rows take the price the reference's shop
 * table lists for the two fairy slots (100 each), the delivery passage the
 * price of the bomb it sells (100). A wallet must HOLD the price at once.
 */
import type { RuleTargetKind } from '../rule-entry.type';

interface PricedEntry {
  kind: RuleTargetKind;
  name: string;
  price: number;
}

const PRICED_ENTRIES: readonly PricedEntry[] = [
  { kind: 'location', name: 'Bottle Merchant', price: 100 },
  { kind: 'location', name: 'King Zora', price: 500 },
  { kind: 'location', name: 'Chest Game', price: 30 },
  { kind: 'location', name: 'Digging Game', price: 80 },
  { kind: 'location', name: 'Blacksmith', price: 10 },
  { kind: 'location', name: 'Capacity Upgrade Shop', price: 100 },
  { kind: 'location', name: 'Capacity Upgrade Left', price: 100 },
  { kind: 'location', name: 'Capacity Upgrade Right', price: 100 },
  { kind: 'exit', name: 'Pyramid Fairy', price: 100 },
];

/** The priciest gate on the way to the goal — the wallet rung the fill must be able to reach. */
const MAX_PRICE = Math.max(...PRICED_ENTRIES.map((entry) => entry.price));

export { MAX_PRICE, PRICED_ENTRIES };
export type { PricedEntry };
