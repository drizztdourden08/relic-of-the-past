/* @layer shared-game @kind logic */
import type { Facing, PoseState } from '../player-pose-atlas.type';
import { FACINGS } from './player-pose-atlas.constants';

const facingsOf = (state: PoseState): readonly Facing[] => (state.perFacing ? FACINGS : [0]);

export { facingsOf };
