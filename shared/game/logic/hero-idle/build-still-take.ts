/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroBeat } from './hero-idle.type';
import { stillBeat } from './still-beat';

const buildStillTake = (facing: Facing, frames: number): HeroBeat[] => [stillBeat(facing, frames)];

export { buildStillTake };
