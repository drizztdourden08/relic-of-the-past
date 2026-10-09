/* @layer shared-game @kind logic */
import type { PoseState } from '../player-pose-atlas.type';
import { POSE_ATLAS } from './player-pose-atlas.constants';

const stateFor = (action: number): PoseState | null =>
  POSE_ATLAS.states.find((s) => s.action === action) ?? null;

export { stateFor };
