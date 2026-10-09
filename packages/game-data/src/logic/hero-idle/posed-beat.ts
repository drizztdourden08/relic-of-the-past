/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';

const posedBeat = (action: number, frame: number, facing: Facing, hold: number): HeroBeat =>
  ({ action, frame, facing, hold, vx: 0, vy: 0 });

export { posedBeat };
