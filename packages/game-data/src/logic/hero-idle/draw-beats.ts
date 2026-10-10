/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';
import { ACTION_CHARGE, CHARGE_FRAMES, CHARGE_HOLDS } from './native-timings.constants';
import { holdAt } from './hold-at';
import { posedBeat } from './posed-beat';

const drawBeats = (facing: Facing): HeroBeat[] =>
  CHARGE_FRAMES.map((frame, index) => posedBeat(ACTION_CHARGE, frame, facing, holdAt(CHARGE_HOLDS, index)));

export { drawBeats };
