/* @layer shared-game @kind types */
/**
 * The vocabulary the hero idler is written in.
 *
 * A SEQUENCE is a named thing the character can be seen doing, like standing,
 * pacing, swinging. A TAKE is one performance of a sequence: the sequence, a
 * facing, and the exact beats it resolved to this time round. A BEAT is one
 * drawn pose held for a whole number of GAME frames, which is the only clock
 * the source animation understands.
 *
 * Beats carry their own facing instead of the take carrying one, because a
 * sequence is allowed to turn part-way through. Looking around is exactly
 * that, and a single facing on the take would make it a different sequence per
 * direction.
 */
import type { Facing } from '../../data/native-tables/player-pose-atlas';

/** How a sequence picks the direction it is performed in. */
type FacingRule = 'keep' | 'random' | 'toward-viewer';

/**
 * Which builder turns a table row into beats. The tunable numbers stay in the
 * table; the shape of the motion is the game's own and lives in code.
 */
type HeroSequenceKind = 'still' | 'look' | 'pace' | 'swing' | 'charge-spin' | 'flourish';

type HeroSequenceId = 'stand' | 'look' | 'walk' | 'swing' | 'spin' | 'raise';

interface HeroSequenceDef {
  id: HeroSequenceId;
  kind: HeroSequenceKind;
  /** Relative likelihood of being picked next. Retune freely; only ratios matter. */
  weight: number;
  facing: FacingRule;
  /**
   * How long the take runs, in game frames, as an inclusive range the chooser
   * samples. Omitted where the game's own tables fix the length. A sword
   * swing is as long as the swing is.
   */
  frames?: readonly [number, number];
}

/** One drawn pose, held for `hold` game frames, drifting at `vx`/`vy` px per frame. */
interface HeroBeat {
  /** Pose-atlas action id (`stateFor`). */
  action: number;
  /** Index into `framesOf(state, facing)`. */
  frame: number;
  facing: Facing;
  hold: number;
  vx: number;
  vy: number;
}

interface HeroTake {
  id: HeroSequenceId;
  beats: readonly HeroBeat[];
  /** Sum of every beat's hold. */
  frames: number;
  /** The facing the next take inherits. */
  endFacing: Facing;
}

interface HeroIdleState {
  take: HeroTake;
  /** Clock value the take started on, in game frames. */
  startedAt: number;
}

/** What the view draws this frame. Offsets are SNES pixels from the anchor. */
interface HeroPose {
  action: number;
  frame: number;
  facing: Facing;
  offsetX: number;
  offsetY: number;
}

/** Uniform in [0, 1). Injected so a take can be replayed exactly in a test. */
type HeroRng = () => number;

export type {
  FacingRule, HeroBeat, HeroIdleState, HeroPose, HeroRng, HeroSequenceDef,
  HeroSequenceId, HeroSequenceKind, HeroTake,
};
