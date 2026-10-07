/* @layer shared-game @kind data */
/**
 * The pond's own ladders and fixed schedules.
 *
 * POND_PRICE_LADDER is the price a Custom throw may cost: rung 0 is free,
 * every other rung is an amount the game itself hands out or charges
 * somewhere, then round thousands up to the biggest wallet a capacity
 * profile can build (9999). The settings and the seed both cut the ladder at
 * what this profile's wallet really reaches (pond-wallet-top.ts), so a vanilla
 * wallet still stops at 999. A Custom setting picks a
 * start and a final rung with the two-thumb range and the curves cut the
 * span between them into one jump per further throw, so the cumulative
 * ladder IS the price list.
 *
 * Vanilla cost reproduces the native economy exactly: the pond charges one
 * hundred rupees per upgrade and a native file can buy fourteen of them
 * (seven per counted family), so fourteen throws of a hundred is the same
 * money for the same number of upgrades.
 */

/** Rung 0 = free; the rest climb to the biggest wallet. New rungs only ever go on the end, so a seed's rung indexes never move. */
const POND_PRICE_LADDER: readonly number[] = [
  0, 5, 10, 20, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 999,
  1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 9999,
];

/** What a vanilla wallet holds: the top a profile with no capacity settings reads. */
const POND_VANILLA_WALLET_TOP = 999;

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
  POND_VANILLA_WALLET_TOP,
};
