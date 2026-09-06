/* @layer renderer-widgets @kind constants */

/** Health is stored in quarter-heart units; a heart is 8 of them. */
const HEART_UNITS = 8;

/** Twenty hearts is the engine's ceiling for the health capacity. */
const MAX_HEALTH = 20 * HEART_UNITS;

/** One heart is the floor the engine enforces on the capacity. */
const MIN_HEALTH = HEART_UNITS;

/** A full magic meter. The meter's capacity is fixed, so this doubles as its maximum. */
const MAGIC_FULL = 0x80;

/** Magic moves in eighths of the meter, which is as fine as the drawn bar reads. */
const MAGIC_STEP = MAGIC_FULL / 16;

/** Bomb capacity tiers run 10, 15, ..., 50, so every legal value is a multiple of 5. */
const BOMB_CAPACITY = { min: 10, max: 50, step: 5 };

/** Arrow capacity tiers run 30, 35, ..., 70, on the same 5-count grid as bombs. */
const ARROW_CAPACITY = { min: 30, max: 70, step: 5 };

/** The quick-fill fractions offered beneath every stat. 100 reads as "Full". */
const PERCENT_STEPS = [25, 50, 75, 100];

export { ARROW_CAPACITY, BOMB_CAPACITY, HEART_UNITS, MAGIC_FULL, MAGIC_STEP, MAX_HEALTH, MIN_HEALTH, PERCENT_STEPS };
