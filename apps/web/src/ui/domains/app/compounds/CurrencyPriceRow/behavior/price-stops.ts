/* @layer renderer-components @kind logic */
/**
 * The discrete amounts a price range's two thumbs sit on. Every whole number
 * up to the fine limit is a stop, whatever the ceiling: the small amounts are
 * the ones a price row is usually set to, and a ladder that skipped them
 * showed a stored 10 as 0. Above that limit the ladder coarsens, because a
 * thumb that has to find one exact rupee in a thousand is not a control
 * anyone can use. The ceiling itself is always the last stop.
 */

/** Every whole number up to this amount is a stop. */
const FINE_LIMIT = 20;
const COARSE_STEP = 25;

const stopsFor = (max: number): readonly string[] => {
  const fine = Array.from({ length: Math.min(max, FINE_LIMIT) + 1 }, (_, index) => String(index));
  if (max <= FINE_LIMIT) return fine;
  const coarse: string[] = [];
  const first = (Math.floor(FINE_LIMIT / COARSE_STEP) + 1) * COARSE_STEP;
  for (let amount = first; amount < max; amount += COARSE_STEP) coarse.push(String(amount));
  return [...fine, ...coarse, String(max)];
};

export { stopsFor };
