/* @layer renderer-lib @kind logic */
/**
 * mulberry32, a seeded 32-bit PRNG used wherever export has to make a random choice.
 *
 * `Math.random()` cannot be used on the export path at all: flattening a `random` layer or a
 * shuffled `loop` layer picks files and gaps, so an unseeded source would make every export of
 * the same pack a different file. With a seed derived from the track number, the same pack
 * always produces byte-identical output while different tracks still sound unalike.
 */

/** Returns a generator of floats in [0, 1). Small, fast, and good enough for scheduling. */
const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** An integer in [0, count). */
const nextIndex = (random: () => number, count: number): number =>
  (count <= 1 ? 0 : Math.min(count - 1, Math.floor(random() * count)));

/** A float in [min, max], collapsing to min when the range is empty or inverted. */
const nextInRange = (random: () => number, min: number, max: number): number =>
  (max <= min ? min : min + random() * (max - min));

/**
 * Derives one stream per layer from the track seed, so adding a layer or changing a layer's
 * file count cannot shift the choices made for the layers beside it.
 */
const streamFor = (seed: number, index: number): (() => number) =>
  mulberry32((seed + index * 0x9e3779b1) >>> 0);

export { mulberry32, nextIndex, nextInRange, streamFor };
