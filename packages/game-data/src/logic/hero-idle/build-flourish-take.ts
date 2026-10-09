/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';
import { RAISE_BLADE_FRAMES } from './hero-idle.constants';
import { ACTION_RAISE_BLADE, RAISE_BLADE_HOLD } from './native-timings';
import { posedBeat } from './posed-beat';

const buildFlourishTake = (facing: Facing): HeroBeat[] =>
  Array.from({ length: RAISE_BLADE_FRAMES }, (_unused, frame) =>
    posedBeat(ACTION_RAISE_BLADE, frame, facing, RAISE_BLADE_HOLD));

export { buildFlourishTake };
