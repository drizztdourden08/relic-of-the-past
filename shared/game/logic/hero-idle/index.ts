/* @layer shared-game @kind logic */
/**
 * Public surface of the hero idler: the table, the chooser, and the pure step.
 *
 * A view needs `startHeroIdle`, `advanceHeroIdle` and `heroPoseAt` and nothing
 * else; the rest is exported for the table's own tests and for anyone
 * retuning it.
 */
export { HERO_SEQUENCES, FACING_TOWARD_VIEWER, REPEATABLE } from './sequence-table';
export {
  START_FACING, advanceHeroIdle, chooseSequence, heroPoseAt, startHeroIdle, takeFor,
} from './hero-idle-machine';
export { MAX_LEG_CYCLES } from './build-move-take';
export { pickInt, pickWeighted, seededRng } from './rng';
export { WALK_CYCLE_FRAMES, WALK_PX_PER_FRAME } from './native-timings';
export type {
  FacingRule, HeroBeat, HeroIdleState, HeroPose, HeroRng, HeroSequenceDef,
  HeroSequenceId, HeroSequenceKind, HeroTake,
} from './hero-idle.type';
