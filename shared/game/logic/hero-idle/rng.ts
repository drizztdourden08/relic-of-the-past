/* @layer shared-game @kind logic */
/**
 * The randomness, kept injectable.
 *
 * The idler takes a `HeroRng` instead of calling `Math.random`, so a test can
 * hand it a seeded one and assert on the exact take it produced. The view hands
 * it `Math.random` and never thinks about it again.
 */
import type { HeroRng } from './hero-idle.type';

/** mulberry32. Small, fast, and good enough for choosing between six rows. */
const seededRng = (seed: number): HeroRng => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** An integer in [min, max], inclusive at both ends. */
const pickInt = (rng: HeroRng, min: number, max: number): number =>
  min + Math.floor(rng() * (max - min + 1));

/** One of `items`, with probability proportional to `weightOf`. Never returns undefined for a non-empty list. */
const pickWeighted = <T>(rng: HeroRng, items: readonly T[], weightOf: (item: T) => number): T => {
  const total = items.reduce((sum, item) => sum + Math.max(0, weightOf(item)), 0);
  if (total <= 0) return items[0];
  let roll = rng() * total;
  for (const item of items) {
    roll -= Math.max(0, weightOf(item));
    if (roll < 0) return item;
  }
  return items[items.length - 1];
};

export { pickInt, pickWeighted, seededRng };
