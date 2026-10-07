/* @layer shared-game @kind logic */
/**
 * The takes with a blade in them, each one the engine's own button sequence
 * played back with nobody pressing anything.
 *
 * A SWING is what a tap does: the draw (action 0x27, nine frames on
 * `kSpinAttackDelays`), then the single swing pose the engine draws at
 * `button_b_frames == 9`, then the release.
 *
 * A SPIN is what a hold does: the same draw, then the held pose looping for
 * the 48 frames `link_spin_attack_step_counter` needs to reach the charge
 * threshold, then the twelve-step release. Written as the sum of those three
 * so the charge really is as long as the game makes a player wait for it.
 *
 * Neither travels: the engine halts the character for the whole of both
 * (`HaltLinkWhenUsingItems`), so a swing that slid across the menu would be
 * this file inventing motion the source does not have.
 */
import {
  ACTION_CHARGE, ACTION_RAISE_BLADE, ACTION_SPIN, ACTION_SWING, ACTION_SWING_HOLD,
  CHARGE_FRAMES, CHARGE_HOLDS, RAISE_BLADE_HOLD, SPIN_CHARGE_FRAMES,
  SPIN_GRAPHICS_BY_FACING, SPIN_HOLDS, SWING_HOLD, SWING_HOLD_FRAMES, SWING_HOLD_HOLDS,
} from './native-timings';
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';

/** How many frames the raise-blade flourish draws for. */
const RAISE_BLADE_FRAMES = 11;

const still = (action: number, frame: number, facing: Facing, hold: number): HeroBeat =>
  ({ action, frame, facing, hold, vx: 0, vy: 0 });

/** Drawing the blade back: action 0x27, frames 0..8 on the engine's own delays. */
const drawBeats = (facing: Facing): HeroBeat[] =>
  CHARGE_FRAMES.map((frame, index) => still(ACTION_CHARGE, frame, facing, CHARGE_HOLDS[index]));

/** One turn of the held-down loop: three poses of action 0x03, twelve frames. */
const holdLoopBeats = (facing: Facing): HeroBeat[] =>
  SWING_HOLD_FRAMES.map((frame, index) => still(ACTION_SWING_HOLD, frame, facing, SWING_HOLD_HOLDS[index]));

const loopFrames = SWING_HOLD_HOLDS.reduce((sum, hold) => sum + hold, 0);

/** A plain swing: draw, cut, done. */
const buildSwingTake = (facing: Facing): HeroBeat[] => [
  ...drawBeats(facing),
  still(ACTION_SWING, 0, facing, SWING_HOLD),
];

/**
 * A charged spin: draw, hold until the charge lands, release. The hold runs
 * whole loops, because stopping half way through one would cut a pose short
 * that the engine never cuts short.
 */
const buildSpinTake = (facing: Facing): HeroBeat[] => {
  const loops = Math.max(1, Math.ceil(SPIN_CHARGE_FRAMES / loopFrames));
  const held = Array.from({ length: loops }, () => holdLoopBeats(facing)).flat();
  const spin = SPIN_GRAPHICS_BY_FACING[facing].map((frame, index) =>
    still(ACTION_SPIN, frame, facing, SPIN_HOLDS[index]));
  return [...drawBeats(facing), ...held, ...spin];
};

/**
 * The blade held overhead, which is the pose the engine reserves for the moment a
 * sword is claimed. It carries no facing of its own in the atlas, so the
 * facing passed here only decides where the take leaves the character looking.
 */
const buildFlourishTake = (facing: Facing): HeroBeat[] =>
  Array.from({ length: RAISE_BLADE_FRAMES }, (_unused, frame) =>
    still(ACTION_RAISE_BLADE, frame, facing, RAISE_BLADE_HOLD));

export { RAISE_BLADE_FRAMES, buildFlourishTake, buildSpinTake, buildSwingTake };
