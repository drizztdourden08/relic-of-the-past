/* @layer shared-game @kind logic */
/**
 * Facings, and the one pixel step each of them walks.
 *
 * Indices are the engine's own `link_direction_facing >> 1`: 0 up, 1 down,
 * 2 left, 3 right. That pairing is what makes `facing ^ 1` the about-turn, because up
 * and down are neighbours and so are left and right. That is the whole
 * mechanism behind a pacing take landing back where it started.
 */
import { FACINGS } from '../../data/native-tables/player-pose-atlas';
import { WALK_PX_PER_FRAME } from './native-timings';
import { pickWeighted } from './rng';
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroRng } from './hero-idle.type';

/** The step one frame of walking takes, in SNES pixels. */
const STEP_BY_FACING: Readonly<Record<Facing, { x: number; y: number }>> = {
  0: { x: 0, y: -WALK_PX_PER_FRAME },
  1: { x: 0, y: WALK_PX_PER_FRAME },
  2: { x: -WALK_PX_PER_FRAME, y: 0 },
  3: { x: WALK_PX_PER_FRAME, y: 0 },
};

/** The way back. */
const opposite = (facing: Facing): Facing => (facing ^ 1) as Facing;

/**
 * A facing other than `avoid`. Turning to the direction already faced is not a
 * turn, and a "look around" that picks the same way twice looks broken rather
 * than random.
 */
const otherFacing = (rng: HeroRng, avoid: Facing): Facing => {
  const options = FACINGS.filter((f) => f !== avoid);
  return pickWeighted(rng, options, () => 1);
};

export { STEP_BY_FACING, opposite, otherFacing };
