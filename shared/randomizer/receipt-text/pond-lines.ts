/* @layer shared-game @kind logic */
/**
 * The three lines the pond speaks for itself. Every other receipt line
 * belongs to an ITEM; these belong to the transaction around it, so they are
 * rendered here instead of routed through render-receipt-message.ts:
 *
 *   the price:   what one toss costs, shown in place of the vanilla
 *                 two-choice line, which offers two native amounts a plan
 *                 does not charge;
 *   the loss:    a throw that wins nothing, carrying the rupees actually
 *                 handed back (the vanilla line promises a flat hundred,
 *                 which is a lie under any plan whose refund is half the
 *                 price);
 *   the closing: an emptied pond, in place of the vanilla come-back-later
 *                 refusal, which invites a player back to a pond that has
 *                 nothing left.
 *
 * Each returns candidates fullest first, so the composer keeps the flavour
 * when the box has room and drops to the bare number when it does not
 * (receipt-line.type.ts). A plan pre-renders one line per DISTINCT price and
 * one per distinct refund (the prices repeat across throws, so the pool
 * stays small) and the core selects by the throw it is resolving.
 */
import type { PondPlan } from '../ap-world/pond/pond-profile.type';
import type { ReceiptLine } from './receipt-line.type';

/** What one toss costs. Rung 0 of the price ladder is free, and says so. */
const pondPriceLine = (price: number): ReceiptLine =>
  (price <= 0
    ? ['This toss is on the house. In it goes.', 'This toss is free.']
    : [`The water asks ${price} rupees for this toss. In they go.`, `${price} rupees for this toss.`]);

/** A throw that won nothing, and the rupees it hands back. */
const pondConsolationLine = (refund: number): ReceiptLine => [
  `Nothing rises this time. Take ${refund} rupees back for your trouble.`,
  `No luck this time. Take ${refund} rupees back.`,
  `${refund} rupees back.`,
];

/** A pond with every throw spent: it is closed for good, not for now. */
const POND_CLOSED_LINE: ReceiptLine = [
  'The water has nothing left to give you. Keep your rupees.',
  'The water has nothing left to give.',
];

/**
 * The pond's line pool for one plan: one line per distinct price, then one
 * per distinct refund, then the closing line last. The two key arrays say
 * which line each amount landed on, so the arming can look an id up by the
 * price or the refund of the throw it is writing.
 */
interface PondLineSet {
  /** Distinct prices, in the order their lines sit in `lines`. */
  prices: readonly number[];
  /** Distinct refunds above zero, in the order their lines follow the prices. */
  refunds: readonly number[];
  /** prices, then refunds, then the closing line: always at least the closing line. */
  lines: readonly ReceiptLine[];
}

/** The distinct values of |amounts| that pass |keep|, in first-seen order. */
const distinct = (amounts: readonly number[], keep: (amount: number) => boolean): number[] =>
  [...new Set(amounts.filter(keep))];

const pondLinesOf = (plan: PondPlan): PondLineSet => {
  const prices = distinct(plan.throws.map((entry) => entry.price), () => true);
  const refunds = distinct(plan.throws.map((entry) => entry.refund), (refund) => refund > 0);
  return {
    prices,
    refunds,
    lines: [...prices.map(pondPriceLine), ...refunds.map(pondConsolationLine), POND_CLOSED_LINE],
  };
};

export { POND_CLOSED_LINE, pondConsolationLine, pondLinesOf, pondPriceLine };
export type { PondLineSet };
