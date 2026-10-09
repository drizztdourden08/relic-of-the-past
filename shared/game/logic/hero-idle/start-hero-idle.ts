/* @layer shared-game @kind logic */
import type { HeroIdleState, HeroRng } from './hero-idle.type';
import { START_FACING } from './hero-idle.constants';
import { chooseSequence } from './choose-sequence';
import { takeFor } from './take-for';

const startHeroIdle = (now: number, rng: HeroRng): HeroIdleState => ({
  take: takeFor(chooseSequence(rng, null), rng, START_FACING),
  startedAt: now,
});

export { startHeroIdle };
