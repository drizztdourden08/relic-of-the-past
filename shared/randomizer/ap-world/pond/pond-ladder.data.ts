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

export {
  POND_MAX_ITEMS,
  POND_MAX_THROWS,
  POND_PRICE_LADDER,
  POND_VANILLA_PRICE,
  POND_VANILLA_THROWS,
};
