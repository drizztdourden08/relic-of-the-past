/* @layer shared-game @kind data */
/**
 * The pond's own ladders and fixed schedules.
 *
 * POND_PRICE_LADDER is the price a Custom throw may cost: rung 0 is free,
 * every other rung is an amount the game itself hands out or charges
 * somewhere, up to the vanilla wallet's 999 ceiling. A Custom setting picks a
 * start and a final rung with the two-thumb range and the curves cut the
 * span between them into one jump per further throw, so the cumulative
 * ladder IS the price list.
 *
 * Vanilla cost reproduces the native economy exactly: the pond charges one
 * hundred rupees per upgrade and a native file can buy fourteen of them
 * (seven per counted family), so fourteen throws of a hundred is the same
 * money for the same number of upgrades.
 *
 * Gamble sells twelve chances at a rising price. A losing throw hands back
 * half of what it cost — always strictly less than the price, so the pond can
 * never be farmed — and the pond closes for good once the twelfth chance is
 * spent.
 */

/** Rung 0 = free; the rest are amounts the game itself uses, up to the vanilla wallet. */
const POND_PRICE_LADDER: readonly number[] = [
  0, 5, 10, 20, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 999,
];

/** The most throws any mode sells, and the most pool items the pond can carry. */
const POND_MAX_THROWS = 20;
const POND_MAX_ITEMS = 20;

/** Vanilla cost: the native hundred per upgrade, over the native seven upgrades per family. */
const POND_VANILLA_PRICE = 100;
const POND_VANILLA_THROWS = 14;

/** Gamble: twelve chances at 20, 40, 60 … 240, half the price back on a loss. */
const POND_GAMBLE_CHANCES = 12;
const POND_GAMBLE_PRICE_STEP = 20;

/** Price of gamble chance |index| (0-based). */
const gamblePriceOf = (index: number): number => POND_GAMBLE_PRICE_STEP * (index + 1);

/** A losing gamble throw hands back half its price, rounded down to a multiple of five. */
const gambleRefundOf = (price: number): number => Math.floor(price / 10) * 5;

export {
  POND_GAMBLE_CHANCES,
  POND_GAMBLE_PRICE_STEP,
  POND_MAX_ITEMS,
  POND_MAX_THROWS,
  POND_PRICE_LADDER,
  POND_VANILLA_PRICE,
  POND_VANILLA_THROWS,
  gamblePriceOf,
  gambleRefundOf,
};
