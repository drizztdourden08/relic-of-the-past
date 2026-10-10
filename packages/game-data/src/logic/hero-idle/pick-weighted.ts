/* @layer shared-game @kind logic */
import type { HeroRng } from './hero-idle.type';

const pickWeighted = <T>(rng: HeroRng, items: readonly T[], weightOf: (item: T) => number): T => {
  const [first] = items;
  const last = items[items.length - 1];
  if (first === undefined || last === undefined) throw new Error('pickWeighted needs at least one item');
  const total = items.reduce((sum, item) => sum + Math.max(0, weightOf(item)), 0);
  if (total <= 0) return first;
  let roll = rng() * total;
  for (const item of items) {
    roll -= Math.max(0, weightOf(item));
    if (roll < 0) return item;
  }
  return last;
};

export { pickWeighted };
