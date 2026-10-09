/* @layer shared-game @kind logic */
export { HERO_SEQUENCES, FACING_TOWARD_VIEWER } from './sequence-table';
export { MAX_LEG_CYCLES, REPEATABLE, START_FACING } from './hero-idle.constants';
export { advanceHeroIdle } from './advance-hero-idle';
export { chooseSequence } from './choose-sequence';
export { heroPoseAt } from './hero-pose-at';
export { startHeroIdle } from './start-hero-idle';
export { takeFor } from './take-for';
export { pickInt } from './pick-int';
export { pickWeighted } from './pick-weighted';
export { seededRng } from './seeded-rng';
export { WALK_CYCLE_FRAMES, WALK_PX_PER_FRAME } from './native-timings';
export type {
  FacingRule, HeroBeat, HeroIdleState, HeroPose, HeroRng, HeroSequenceDef,
  HeroSequenceId, HeroSequenceKind, HeroTake,
} from './hero-idle.type';
