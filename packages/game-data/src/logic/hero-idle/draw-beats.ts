/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';
import { ACTION_CHARGE, CHARGE_FRAMES, CHARGE_HOLDS } from './native-timings';
import { posedBeat } from './posed-beat';

const drawBeats = (facing: Facing): HeroBeat[] =>
  CHARGE_FRAMES.map((frame, index) => posedBeat(ACTION_CHARGE, frame, facing, CHARGE_HOLDS[index]));

export { drawBeats };
