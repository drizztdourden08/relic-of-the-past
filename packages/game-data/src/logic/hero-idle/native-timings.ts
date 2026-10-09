/* @layer shared-game @kind data */
const ACTION_WALK = 0x00;
const ACTION_SWING = 0x02;
const ACTION_SWING_HOLD = 0x03;
const ACTION_SPIN = 0x0f;
const ACTION_RAISE_BLADE = 0x17;
const ACTION_CHARGE = 0x27;

const WALK_FRAMES: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8];
const WALK_HOLDS: readonly number[] = [2, 3, 2, 2, 2, 3, 2, 1];
const WALK_CYCLE_FRAMES = 17;

const WALK_PX_PER_FRAME = 1;

const CHARGE_FRAMES: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const CHARGE_HOLDS: readonly number[] = [2, 1, 1, 1, 1, 4, 1, 1, 2];
const SWING_HOLD = 8;

const SWING_HOLD_FRAMES: readonly number[] = [0, 1, 2];
const SWING_HOLD_HOLDS: readonly number[] = [4, 4, 4];
const SPIN_CHARGE_FRAMES = 48;

const SPIN_GRAPHICS_BY_FACING: readonly (readonly number[])[] = [
  [10, 11, 10, 6, 7, 8, 9, 2, 3, 4, 5, 10],
  [0, 1, 0, 2, 3, 4, 5, 6, 7, 8, 9, 0],
  [12, 13, 12, 4, 5, 6, 7, 8, 9, 2, 3, 12],
  [14, 15, 14, 8, 9, 2, 3, 4, 5, 6, 7, 14],
];
const SPIN_HOLDS: readonly number[] = [2, 6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6];

const RAISE_BLADE_HOLD = 3;

export {
  ACTION_CHARGE, ACTION_RAISE_BLADE, ACTION_SPIN, ACTION_SWING, ACTION_SWING_HOLD,
  ACTION_WALK, CHARGE_FRAMES, CHARGE_HOLDS, RAISE_BLADE_HOLD, SPIN_CHARGE_FRAMES,
  SPIN_GRAPHICS_BY_FACING, SPIN_HOLDS, SWING_HOLD, SWING_HOLD_FRAMES, SWING_HOLD_HOLDS,
  WALK_CYCLE_FRAMES, WALK_FRAMES, WALK_HOLDS, WALK_PX_PER_FRAME,
};
