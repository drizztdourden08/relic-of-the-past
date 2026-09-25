/* @layer shared-game @kind data */
/**
 * The engine's own animation clocks, transcribed.
 *
 * Every number here is read off the decompilation, not chosen: an idle
 * that invents its own timings looks like a different character. Each table
 * names the branch it came from so it can be checked instead of trusted.
 *
 * The engine expresses a hold in two different ways and both are folded to
 * "frames this pose stays up" here:
 *  - a counter that COUNTS UP to the table value (`++c >= tab`, walking), so
 *    the hold is the table value itself;
 *  - a timer that COUNTS DOWN past zero (`sign8(--t)`, every sword clock), so
 *    the hold is the table value plus one.
 */

/** Pose-atlas action ids this module and the table below draw. */
const ACTION_WALK = 0x00;
const ACTION_SWING = 0x02;
const ACTION_SWING_HOLD = 0x03;
const ACTION_SPIN = 0x0f;
const ACTION_RAISE_BLADE = 0x17;
const ACTION_CHARGE = 0x27;

/**
 * Walking. `Link_HandleMovingAnimation`'s `tab3`, on the normal-speed branch
 * (`x = link_animation_steps`, no dash, no drag): the counter counts up to the
 * table value, so these ARE the holds. Step 0 is the standing frame and is
 * only ever entered once (the cycle wraps 8 → 1), so the loop is frames 1..8
 * and lasts 17 frames.
 */
const WALK_FRAMES: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];
const WALK_HOLDS: readonly number[] = [2, 3, 2, 2, 2, 3, 2, 1];
const WALK_CYCLE_FRAMES = 17;

/**
 * The player character covers one pixel per frame at the normal walking speed,
 * so a whole cycle is 17 px, a little over one tile. That is what lets a
 * pacing take be measured in CYCLES and still land back on the pixel it left.
 */
const WALK_PX_PER_FRAME = 1;

/**
 * Drawing a sword. `LinkItem_Sword` advances `button_b_frames` 0 → 8 on
 * `kSpinAttackDelays`, and `LinkOam_Main` draws action 0x27 at that index; the
 * timer counts down past zero, so each hold is the delay plus one. The swing
 * itself (action 0x02) is the single frame the engine draws at
 * `button_b_frames == 9`, before the release resets everything.
 */
const CHARGE_FRAMES: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const CHARGE_HOLDS: readonly number[] = [2, 1, 1, 1, 1, 4, 1, 1, 2];
/** How long the swing pose stays up. `kSpinAttackDelays[9]` is 0, plus one. */
const SWING_HOLD = 8;

/**
 * Holding the button down after the swing. `Player_Sword_SpinAttackJerks_HoldDown`
 * walks `button_b_frames` 10 → 12 and wraps, and `LinkOam_Main` draws action
 * 0x03 at `button_b_frames - 10`. `kSpinAttackDelays[10..12]` is 3,3,3.
 */
const SWING_HOLD_FRAMES: readonly number[] = [0, 1, 2];
const SWING_HOLD_HOLDS: readonly number[] = [4, 4, 4];
/**
 * `link_spin_attack_step_counter` has to reach 48 before the release is a spin,
 * and it ticks once per frame while the button is down.
 */
const SPIN_CHARGE_FRAMES = 48;

/**
 * The spin itself. `Link_HandleSpinAttack` walks a 12-step counter, drawing
 * `kLinkSpinGraphicsByDir[facing * 12 + step]` (the shared 16-frame action
 * 0x0f) on `kLinkSpinDelays`, again a count-down timer, so plus one.
 */
const SPIN_GRAPHICS_BY_FACING: readonly (readonly number[])[] = [
  [10, 11, 10, 6, 7, 8, 9, 2, 3, 4, 5, 10],
  [0, 1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0],
  [12, 13, 12, 4, 5, 6, 7, 8, 9, 2, 3, 12],
  [14, 15, 14, 8, 9, 2, 3, 4, 5, 6, 7, 14],
];
const SPIN_HOLDS: readonly number[] = [2, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6];

/**
 * Raising the blade overhead (`link_unk_master_sword`, action 0x17). The engine
 * drives this one off a cutscene counter instead of a table; three frames a
 * pose is the rate that counter runs at, and the pose has no facing of its own.
 */
const RAISE_BLADE_HOLD = 3;

export {
  ACTION_CHARGE, ACTION_RAISE_BLADE, ACTION_SPIN, ACTION_SWING, ACTION_SWING_HOLD,
  ACTION_WALK, CHARGE_FRAMES, CHARGE_HOLDS, RAISE_BLADE_HOLD, SPIN_CHARGE_FRAMES,
  SPIN_GRAPHICS_BY_FACING, SPIN_HOLDS, SWING_HOLD, SWING_HOLD_FRAMES, SWING_HOLD_HOLDS,
  WALK_CYCLE_FRAMES, WALK_FRAMES, WALK_HOLDS, WALK_PX_PER_FRAME,
};
