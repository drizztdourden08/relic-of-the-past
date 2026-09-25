/* @layer shared-game @kind logic */
/**
 * The three takes with no sword in them: standing, looking about, and pacing.
 *
 * PACING RETURNS BY CONSTRUCTION, not by arithmetic. The return leg is the
 * out leg's beats with the facing turned about and the step negated, so the
 * two legs cancel exactly whatever length was sampled. There is no drift to
 * correct and no snap at the end. The excursion is capped at
 * `MAX_LEG_CYCLES` walk cycles (17 px each) so the character paces around the
 * spot they are standing on instead of leaving it: they are drawn AT the live
 * player's position, and a stroll of a hundred pixels would contradict the
 * one fact the portrait is there to state.
 */
import { ACTION_WALK, WALK_CYCLE_FRAMES, WALK_FRAMES, WALK_HOLDS } from './native-timings';
import { STEP_BY_FACING, opposite, otherFacing } from './facing';
import { pickInt } from './rng';
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat, HeroRng } from './hero-idle.type';

/** Frame 0 of the walk action is the character standing still. */
const STANDING_FRAME = 0;

/** At most two cycles (34 px) out before the return leg starts. */
const MAX_LEG_CYCLES = 2;
/** How many times a "look around" take turns its head. */
const LOOK_TURNS: readonly [number, number] = [2, 3];

const stillBeat = (facing: Facing, hold: number): HeroBeat =>
  ({ action: ACTION_WALK, frame: STANDING_FRAME, facing, hold, vx: 0, vy: 0 });

/** One 17-frame walk cycle, travelling in `facing`. */
const walkCycle = (facing: Facing): HeroBeat[] => {
  const step = STEP_BY_FACING[facing];
  return WALK_FRAMES.map((frame, index) => ({
    action: ACTION_WALK,
    frame,
    facing,
    hold: WALK_HOLDS[index],
    vx: step.x,
    vy: step.y,
  }));
};

const repeat = <T>(count: number, make: (index: number) => T[]): T[] =>
  Array.from({ length: count }, (_unused, index) => make(index)).flat();

/** Standing still, facing wherever the last take left them. */
const buildStillTake = (facing: Facing, frames: number): HeroBeat[] => [stillBeat(facing, frames)];

/**
 * Standing, but turning to look somewhere two or three times. Drawn from the
 * walk action's standing frame, which is the pose the engine itself parks on.
 */
const buildLookTake = (rng: HeroRng, facing: Facing, frames: number): HeroBeat[] => {
  const turns = pickInt(rng, LOOK_TURNS[0], LOOK_TURNS[1]);
  const hold = Math.max(1, Math.round(frames / turns));
  const beats: HeroBeat[] = [];
  let at = facing;
  for (let turn = 0; turn < turns; turn++) {
    at = otherFacing(rng, at);
    beats.push(stillBeat(at, hold));
  }
  return beats;
};

/**
 * Pacing: `pairs` round trips of `legCycles` walk cycles each. The sampled
 * length is quantised to whole cycles first, because half a cycle is a foot
 * left in the air and half a step of drift that never comes back.
 */
const buildPaceTake = (rng: HeroRng, facing: Facing, frames: number): HeroBeat[] => {
  const wanted = Math.max(2, Math.round(frames / WALK_CYCLE_FRAMES));
  const legCycles = Math.max(1, Math.min(MAX_LEG_CYCLES, Math.floor(wanted / 2)));
  const pairs = Math.max(1, Math.round(wanted / (2 * legCycles)));
  const back = opposite(facing);
  return repeat(pairs, () => [
    ...repeat(legCycles, () => walkCycle(facing)),
    ...repeat(legCycles, () => walkCycle(back)),
  ]);
};

export { MAX_LEG_CYCLES, STANDING_FRAME, buildLookTake, buildPaceTake, buildStillTake };
