/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';
import { STANDING_FRAME } from './hero-idle.constants';
import { ACTION_WALK } from './native-timings.constants';

const stillBeat = (facing: Facing, hold: number): HeroBeat =>
  ({ action: ACTION_WALK, frame: STANDING_FRAME, facing, hold, vx: 0, vy: 0 });

export { stillBeat };
