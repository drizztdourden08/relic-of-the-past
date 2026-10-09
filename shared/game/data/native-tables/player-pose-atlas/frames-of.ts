/* @layer shared-game @kind logic */
import type { Facing, PoseFrame, PoseState } from '../player-pose-atlas.type';
import { POSE_ATLAS } from './player-pose-atlas.constants';

const framesOf = (state: PoseState, facing: Facing): readonly PoseFrame[] => {
  const key = String(state.perFacing ? facing : 0);
  const slots = state.frames[key] ?? [];
  return slots.map((slot) => POSE_ATLAS.frames[slot]).filter(Boolean);
};

export { framesOf };
