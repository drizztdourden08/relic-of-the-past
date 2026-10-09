/* @layer shared-game @kind logic */
import type { HeroIdleState, HeroRng } from './hero-idle.type';
import { MAX_CATCH_UP_TAKES } from './hero-idle.constants';
import { chooseSequence } from './choose-sequence';
import { takeFor } from './take-for';

const advanceHeroIdle = (state: HeroIdleState, now: number, rng: HeroRng): HeroIdleState => {
  let next = state;
  for (let guard = 0; guard < MAX_CATCH_UP_TAKES; guard++) {
    const end = next.startedAt + next.take.frames;
    if (now < end) return next;
    const def = chooseSequence(rng, next.take.id);
    next = { take: takeFor(def, rng, next.take.endFacing), startedAt: end };
  }
  return { ...next, startedAt: now };
};

export { advanceHeroIdle };
