/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';
import { ACTION_SWING, SWING_HOLD } from './native-timings';
import { drawBeats } from './draw-beats';
import { posedBeat } from './posed-beat';

const buildSwingTake = (facing: Facing): HeroBeat[] => [
  ...drawBeats(facing),
  posedBeat(ACTION_SWING, 0, facing, SWING_HOLD),
];

export { buildSwingTake };
