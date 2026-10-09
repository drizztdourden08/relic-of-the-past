/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';
import {
  ACTION_SPIN, ACTION_SWING_HOLD, SPIN_CHARGE_FRAMES, SPIN_GRAPHICS_BY_FACING, SPIN_HOLDS, SWING_HOLD_FRAMES,
  SWING_HOLD_HOLDS,
} from './native-timings';
import { drawBeats } from './draw-beats';
import { posedBeat } from './posed-beat';

const holdLoopBeats = (facing: Facing): HeroBeat[] =>
  SWING_HOLD_FRAMES.map((frame, index) => posedBeat(ACTION_SWING_HOLD, frame, facing, SWING_HOLD_HOLDS[index]));

const loopFrames = SWING_HOLD_HOLDS.reduce((sum, hold) => sum + hold, 0);

const buildSpinTake = (facing: Facing): HeroBeat[] => {
  const loops = Math.max(1, Math.ceil(SPIN_CHARGE_FRAMES / loopFrames));
  const held = Array.from({ length: loops }, () => holdLoopBeats(facing)).flat();
  const spin = SPIN_GRAPHICS_BY_FACING[facing].map((frame, index) =>
    posedBeat(ACTION_SPIN, frame, facing, SPIN_HOLDS[index]));
  return [...drawBeats(facing), ...held, ...spin];
};

export { buildSpinTake };
