/* @layer shared-game @kind logic */
import type { Facing } from '../../data/native-tables/player-pose-atlas';

const opposite = (facing: Facing): Facing => (facing ^ 1) as Facing;

export { opposite };
