/* @layer shared-game @kind logic */
/**
 * The idler: pick a sequence, play it out, pick again.
 *
 * Pure and clock-driven. Nothing here owns a timer or a frame loop. The
 * caller passes the current value of a game-frame clock and gets back the
 * state and the pose that belong to it, which is what lets the whole
 * behaviour be stepped by hand in a test.
 *
 * Every take starts and ends on the anchor, so `advance` never has to carry a
 * position between takes: the offset is a property of where you are INSIDE a
 * take and is zero at both of its ends.
 */
import { FACING_TOWARD_VIEWER, HERO_SEQUENCES, REPEATABLE } from './sequence-table';
import { buildLookTake, buildPaceTake, buildStillTake } from './build-move-take';
import { buildFlourishTake, buildSpinTake, buildSwingTake } from './build-sword-take';
import { otherFacing } from './facing';
import { pickInt, pickWeighted } from './rng';
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type {
  HeroBeat, HeroIdleState, HeroPose, HeroRng, HeroSequenceDef, HeroTake,
} from './hero-idle.type';

const START_FACING = FACING_TOWARD_VIEWER as Facing;

const facingFor = (def: HeroSequenceDef, rng: HeroRng, current: Facing): Facing => {
  if (def.facing === 'toward-viewer') return START_FACING;
  if (def.facing === 'random') return otherFacing(rng, current);
  return current;
};

/** The sampled length of this take, in game frames. Fixed-length kinds ignore it. */
const lengthFor = (def: HeroSequenceDef, rng: HeroRng): number =>
  def.frames ? pickInt(rng, def.frames[0], def.frames[1]) : 0;

const beatsFor = (def: HeroSequenceDef, rng: HeroRng, facing: Facing): HeroBeat[] => {
  const frames = lengthFor(def, rng);
  if (def.kind === 'still') return buildStillTake(facing, frames);
  if (def.kind === 'look') return buildLookTake(rng, facing, frames);
  if (def.kind === 'pace') return buildPaceTake(rng, facing, frames);
  if (def.kind === 'swing') return buildSwingTake(facing);
  if (def.kind === 'charge-spin') return buildSpinTake(facing);
  return buildFlourishTake(facing);
};

const takeFor = (def: HeroSequenceDef, rng: HeroRng, current: Facing): HeroTake => {
  const facing = facingFor(def, rng, current);
  const beats = beatsFor(def, rng, facing);
  return {
    id: def.id,
    beats,
    frames: beats.reduce((sum, beat) => sum + beat.hold, 0),
    endFacing: beats[beats.length - 1]?.facing ?? facing,
  };
};

/** The next row, never the row just played unless that row is allowed to repeat. */
const chooseSequence = (rng: HeroRng, previous: string | null): HeroSequenceDef => {
  const options = HERO_SEQUENCES.filter(
    (def) => def.id !== previous || REPEATABLE.has(def.id));
  const from = options.length > 0 ? options : HERO_SEQUENCES;
  return pickWeighted(rng, from, (def) => def.weight);
};

/** The first take. `now` is whatever the caller's frame clock reads. */
const startHeroIdle = (now: number, rng: HeroRng): HeroIdleState => ({
  take: takeFor(chooseSequence(rng, null), rng, START_FACING),
  startedAt: now,
});

/**
 * The state that belongs to `now`. Returns the same object while the current
 * take is still running, so a caller can compare by identity to know whether
 * anything changed.
 */
const advanceHeroIdle = (state: HeroIdleState, now: number, rng: HeroRng): HeroIdleState => {
  let next = state;
  // A loop, not an `if`: a menu left open in a background tab can come back
  // with several takes' worth of clock to catch up on.
  for (let guard = 0; guard < 64; guard++) {
    const end = next.startedAt + next.take.frames;
    if (now < end) return next;
    const def = chooseSequence(rng, next.take.id);
    next = { take: takeFor(def, rng, next.take.endFacing), startedAt: end };
  }
  return { ...next, startedAt: now };
};

const REST: HeroPose = { action: 0x00, frame: 0, facing: START_FACING, offsetX: 0, offsetY: 0 };

/** What to draw at `now`. Clamps to the take's last beat instead of falling off it. */
const heroPoseAt = (state: HeroIdleState, now: number): HeroPose => {
  const { beats } = state.take;
  if (beats.length === 0) return REST;
  let left = Math.max(0, Math.min(now - state.startedAt, state.take.frames - 1));
  let offsetX = 0;
  let offsetY = 0;
  for (const beat of beats) {
    if (left < beat.hold) {
      return {
        action: beat.action,
        frame: beat.frame,
        facing: beat.facing,
        offsetX: offsetX + beat.vx * left,
        offsetY: offsetY + beat.vy * left,
      };
    }
    left -= beat.hold;
    offsetX += beat.vx * beat.hold;
    offsetY += beat.vy * beat.hold;
  }
  const last = beats[beats.length - 1];
  return { action: last.action, frame: last.frame, facing: last.facing, offsetX, offsetY };
};

export { START_FACING, advanceHeroIdle, chooseSequence, heroPoseAt, startHeroIdle, takeFor };
